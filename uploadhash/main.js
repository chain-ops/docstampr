
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
                return `
                    <div id="delete-file" class="icon"><i class="ion-ios-paper-outline"></i></div>
                    <div class="file-desc">
                        <div class="file file--${fileIndex}">
                            File:
                            <div class="name"><span>${files[fileIndex].name}</span></div>
                        </div>
                        <div class="file hash">
                            Hash:
                            <div class="name"><span id="file-input-hash">${files[fileIndex].name}</span></div>
                    </div>
                `;
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
        setTimeout(() => {
            $(".list-files").innerHTML = App.template(files, file);
            sha256Hash(files[file]);
            $("#delete-file").addEventListener("click", evt => {
                backToUplaod();
            });
        }, 1000);

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

    function backToUplaod(file) {
        $(".list-files").innerHTML = "";
        $("footer").classList.remove("hasFiles");
        setTimeout(() => {
            $("#drop").classList.remove("hidden");
        }, 500);
    }

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

    // input change
    $("input[type=file]").addEventListener("change", handleFileSelectEvent);
})();
