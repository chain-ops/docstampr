
let App = {};

App.existsHash = function(hash) {
    $.get( "http://localhost:8888/hashes/"+hash, function( data ) {
        $( ".result" ).html( data );
    });
}

App.sendHash = function (hash) {
    $.post("http://localhost:8888/hashes", hash, function(data, status){
        console.log(data)
    }, 'text');
}

App.template = function (files, fileIndex) {
                return `<div class="file file--${fileIndex}">
                    <div class="name"><span>${files[fileIndex].name}</span></div>
                </div>
                <div id="file-input-hash" class="hash"></div>`;
}
App.init = (function() {
    const $ = document.querySelector.bind(document);

    function handleFileSelectEvent(evt) {
        const files = evt.target.files;
        handleFileSelect(files)// FileList object
    }

    function handleFileSelect(files) {
        //files template
        let file = 0;
        $("#drop").classList.add("hidden");
        $("footer").classList.add("hasFiles");
        $(".importar").classList.add("active");
        setTimeout(() => {
            $(".list-files").innerHTML = App.template(files, file);
            sha256Hash(files[file]);
        }, 1000);

        let load = 2000; // fake load
        setTimeout(() => {

        }, load);
    }

    // trigger input
    $("#triggerFile").addEventListener("click", evt => {
        evt.preventDefault();
        $("input[type=file]").click();
    });

    // drop events
    $("#drop").ondragleave = evt => {
        $("#drop").classList.remove("active");
        evt.preventDefault();
    };
    $("#drop").ondragover = $("#drop").ondragenter = evt => {
        $("#drop").classList.add("active");
        evt.preventDefault();
    };
    $("#drop").ondrop = evt => {
        $("input[type=file]").files = evt.dataTransfer.files;
        handleFileSelect(evt.dataTransfer.files);
        evt.preventDefault();
    };

    function sha256Hash(file) {
        var reader = new FileReader();
        reader.onload = onFileReady;
        reader.readAsBinaryString(file);
    }

    function onFileReady(event) {
        var hash = sha256(event.target.result);
        App.sendHash(hash);
        showHash(hash);
    }

    function showHash(hash) {
        $("#file-input-hash").innerText = hash;
        hide($("#drop"));
    }

    function hide(elem) {
        elem.classList.add("hidden");
    }
    function show(elem) {
        elem.classList.remove("hidden");
    }

    $(".importar").addEventListener("click", () => {
        $(".list-files").innerHTML = "";
        $("footer").classList.remove("hasFiles");
        $(".importar").classList.remove("active");
        setTimeout(() => {
            $("#drop").classList.remove("hidden");
        }, 500);
    });

    // input change
    $("input[type=file]").addEventListener("change", handleFileSelectEvent);
})();
