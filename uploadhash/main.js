
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
                    <div class="row">
                        <div class="col-2">
                            <div id="delete-file" class="icon"><i class="ion-ios-paper-outline"></i></div>
                        </div>
                        <div class="col-9">
                            <div class="file-desc">
                                <div class="row">
                                    <div class="col-1 text-left">
                                      File:
                                    </div>
                                    <div class="col-10 text-left text-truncate">
                                      ${files[fileIndex].name}
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-1 text-left">
                                        Hash:
                                    </div>
                                    <div class="col-10 text-left text-truncate" id="file-input-hash">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <form>
                        <div class="row">
                          <div class="col-2">
                            <button type="submit" class="btn btn-primary importar">Update</button>
                          </div>
                          <div class="col-9">
                            <div class="form-group">
                              <input type="tect" class="form-control form-control-sm" id="tag" aria-describedby="tagHelp" placeholder="Enter tags">
                            </div>
                            <div class="form-check">
                              <input type="checkbox" class="form-check-input" id="exampleCheck1">
                              <label class="form-check-label" for="exampleCheck1">Upload file</label>
                            </div>
                          </div>
                        </div>
                    </form>
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
        showFooter();
        setTimeout(() => {
            $(".list-files").innerHTML = App.template(files, file);
            sha256Hash(files[file]);
            $("#delete-file").addEventListener("click", evt => {
                showBody();
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

    function showBody() {
        $(".list-files").innerHTML = "";

        $("footer").classList.remove("hasFiles");
        $("#hash").classList.add("hidden");

        setTimeout(() => {
            $("#drop").classList.remove("hidden");
        }, 500);
    }

    function showFooter() {
        $("footer").classList.add("hasFiles");
        $("#drop").classList.add("hidden");
        $("#hash").classList.remove("hidden");
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
