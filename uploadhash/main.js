
let App = {};
App.baseUrl = "http://peer1.pr-bc1.civis-blockchain.org:8889";

App.existsHash = function(hash) {
    $.get( App.baseUrl+"/hashes/", hash, function( data ) {
        $( ".result" ).html( data );
    });
}

App.sendHash = function (hash) {
    App.hash = hash;
    $.post(App.baseUrl+"/hashes", hash, function(data, status){
        console.log(data)
    }, 'text');
}


$( document ).ready(function() {
    App.init();
});


App.updateMetadata = function () {
    var tags = $('#tag');
    var uploadFileChecked = $('#uploadFileCheck')[0].checked;

    var data = new FormData();
    data.append('tags', tags.val());

    if(uploadFileChecked) {
        var fileInput = $('#file-input')[0].files[0];
        data.append('file', fileInput);
    }
    // uploadFileCheck.value

    $.ajax({
        type: "POST",
        url: App.baseUrl+"/hashes/"+App.hash+"/metadata",
        data: data,

        // prevent jQuery from automatically transforming the data into a query string
        processData: false,
        contentType: false,
        cache: false,
        timeout: 1000000,
        success: function(data, textStatus, jqXHR) {
            console.log("SUCCESS : ", data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("ERROR : ", jqXHR.responseText);

        }
    });

    $.post("", hash, function(data, status){
        console.log(data)
    }, 'text');
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
        $("#file-name").innerText = files[file].name
        showFooter();
        sha256Hash(files[file]);
        $("#delete-file").addEventListener("click", evt => {
            evt.preventDefault();
            showBody();
        });
        $("#update").addEventListener("click", evt => {
            evt.preventDefault();
            App.updateMetadata();
        });
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
        $("footer").classList.remove("hasFiles");
        $("#hash").classList.add("hidden");
        setTimeout(() => {
            $("#drop").classList.remove("hidden");
        }, 500);
    }

    function showFooter() {
        $("#drop").classList.add("hidden");
        $("footer").classList.add("hasFiles");
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
});
