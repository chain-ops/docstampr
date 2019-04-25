let App = {};
App.hashBaseUrl = "http://peer1.pr-bc1.civis-blockchain.org:8889/hashes";

App.sendHash = function (hash) {
    return new Promise((resolve, reject) => {
        $.post(App.hashBaseUrl, hash, function (data, status) {
            resolve(hash);
        }, 'text');
    })
};


App.getMetadata = function (hash) {
    return new Promise((resolve, reject) => {
        $.get(App.hashBaseUrl + '/' + hash, function (data, status) {
            if (data != null && data.public != null) {
                resolve(data);
            } else {
                reject();
            }
        }, 'json');
    })
};

App.startLoading = function (hash) {
    $('#loading')[0].classList.remove("hidden");
};

App.stopLoading = function (hash) {
    $('#loading')[0].classList.add("hidden");
};
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})
$(document).ready(function () {
    App.init();

});

App.download = function (url) {
    var a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", $('#file-name').innerHTML);
    a.click();
    return false;
};

App.updateMetadata = function (hash) {
    var author = $('#inputAuthor');
    var version = $('#inputVersion');
    var description = $('#inputDescription');
    var uploadFileChecked = $('#uploadFileCheck')[0].checked;

    var metadata = {
        "author": author.val(),
        "version": version.val(),
        "description": description.val()
    };

    var data = new FormData();
    data.append('metadata', JSON.stringify(metadata));

    if (uploadFileChecked) {
        var fileInput = $('#file-input')[0].files[0];
        data.append('file', fileInput);
    }
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: App.hashBaseUrl + "/" + hash + "/metadata",
            data: data,
            // prevent jQuery from automatically transforming the data into a query string
            processData: false,
            contentType: false,
            cache: false,
            timeout: 1000000,
            success: function (data, textStatus, jqXHR) {
                resolve(data)
            },
            error: function (jqXHR, textStatus, errorThrown) {
                reject(jqXHR.responseText);

            }
        });
    });
};

App.init = (function () {
    const $ = document.querySelector.bind(document);

    function handleFileSelectEvent(evt) {
        const files = evt.target.files;
        handleFileSelect(files)// FileList object
    }

    function handleFileSelect(files) {
        //files template
        let file = 0;
        $("#file-name").innerText = files[file].name;
        sha256Hash(files[file]);
    }

    // trigger input
    $("#triggerFile").addEventListener("click", evt => {
        evt.preventDefault();
        $("input[type=file]").click();
    });

    $("#triggerFileIcon").addEventListener("click", evt => {
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
        App.startLoading();
        var reader = new FileReader();
        reader.onload = onFileReady;
        reader.readAsBinaryString(file);
    }

    function onFileReady(event) {
        var hash = sha256(event.target.result);
        App.sendHash(hash).then(data => {
            showMetadata(hash);
        });
    }

    function showMetadata(hash) {
        App.getMetadata(hash).then(data => {
            showHash(hash);
            downloadMode(hash, data);
            showFooter();
            App.stopLoading()
        }, () => {
            showHash(hash);
            updateMode(hash);
            showFooter();
            App.stopLoading()
        });
    }

    function downloadMode(hash, data) {
        publicData = JSON.parse(data.public)
        $('#inputAuthor').value = publicData.author
        $('#inputAuthor').readOnly = true
        $('#inputVersion').value = publicData.version
        $('#inputVersion').readOnly = true
        $('#inputDescription').innerText = publicData.description
        $('#inputDescription').readOnly = true

        $("#uploadFileCheck").closest('.form-group').remove()
        var url = publicData.url;
        if (publicData.filename) {
            url = App.hashBaseUrl + "/" + hash + "/file";
        }

        if (url) {
            hide(document.getElementById("update"));
            show(document.getElementById("download"));
            document.getElementById("download").setAttribute('data-url', url);
            document.getElementById("download").addEventListener("click", evt => {
                evt.preventDefault();
                App.download(url);
            });
        } else {
            $("#update").remove()
        }
    }

    function updateMode(hash) {
        $("#update").addEventListener("click", evt => {
            evt.preventDefault();
            App.startLoading();
            App.updateMetadata(hash).then(data => {
                showMetadata(hash);
            });
        });
    }

    function updateMetadataEvt(evt) {
        evt.preventDefault();
        App.startLoading();
        App.updateMetadata(hash).then(data => {
            showMetadata(hash);
        });
    }

    function showHash(hash) {
        $("#file-input-hash").innerText = hash;
        $("#clipboard-hash").addEventListener("click", evt => {
            evt.preventDefault();
            App.copyToClipboard("#file-input-hash");
        });
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

App.copyToClipboard = function (element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).text()).select();
    document.execCommand("copy");
    $temp.remove();
}
