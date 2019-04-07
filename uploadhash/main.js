
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
                    <div class="progress active"></div>
                    <div class="done">
	                    <a href="" target="_blank">
                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 1000 1000">
		                        <g><path id="path" d="M500,10C229.4,10,10,229.4,10,500c0,270.6,219.4,490,490,490c270.6,0,490-219.4,490-490C990,229.4,770.6,10,500,10z M500,967.7C241.7,967.7,32.3,758.3,32.3,500C32.3,241.7,241.7,32.3,500,32.3c258.3,0,467.7,209.4,467.7,467.7C967.7,758.3,758.3,967.7,500,967.7z M748.4,325L448,623.1L301.6,477.9c-4.4-4.3-11.4-4.3-15.8,0c-4.4,4.3-4.4,11.3,0,15.6l151.2,150c0.5,1.3,1.4,2.6,2.5,3.7c4.4,4.3,11.4,4.3,15.8,0l308.9-306.5c4.4-4.3,4.4-11.3,0-15.6C759.8,320.7,752.7,320.7,748.4,325z"</g>
		                    </svg>
						</a>
                    </div>
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
        }, 1000);

        let load = 2000; // fake load
        setTimeout(() => {
            $(`.file--${file}`).querySelector(".progress").classList.remove("active");
            $(`.file--${file}`).querySelector(".done").classList.add("anim");
            sha256Hash(files[file]);
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
