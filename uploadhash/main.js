
let App = {};
App.hashBaseUrl = "http://peer1.pr-bc1.civis-blockchain.org:8899/hashes";

App.existsHash = function(hash) {
    $.get( App.hashBaseUrl, hash, function( data ) {
        $( ".result" ).html( data );
    });
};

App.sendHash = function (hash) {
    App.hash = hash;
    $.post(App.hashBaseUrl, hash, function(data, status){
    }, 'text');
};


App.getMetadata = function (hash) {
    App.hash = hash;
    return new Promise((resolve, reject) => {
      $.get(App.hashBaseUrl+'/'+hash,function(data, status){
        data = JSON.parse(data)
        if (data != null && data.public != null) {
          resolve(data);
        } else {
          reject();
        }
      }, 'text');
    })

};

$( document ).ready(function() {
    App.init();
});

App.download = function () {
  var a = document.createElement("a");
  a.href = document.getElementById('update').getAttribute('data-url');
  a.setAttribute("download", $('#file-name').innerHTML);
  a.click();
  return false;
}
App.updateMetadata = function () {
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
    data.append('metadata', JSON.stringify(metadata) );

    if(uploadFileChecked) {
        var fileInput = $('#file-input')[0].files[0];
        data.append('file', fileInput);
    }
    $.ajax({
        type: "POST",
        url: App.hashBaseUrl+"/"+App.hash+"/metadata",
        data: data,

        // prevent jQuery from automatically transforming the data into a query string
        processData: false,
        contentType: false,
        cache: false,
        timeout: 1000000,
        success: function(data, textStatus, jqXHR) {
            window.alert("SUCCESS - transaction id = "+data.transactionId);
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
        // $("#delete-file").addEventListener("click", evt => {
        //     evt.preventDefault();
        //     showBody();
        // });

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
        var reader = new FileReader();
        reader.onload = onFileReady;
        reader.readAsBinaryString(file);
    }

    function onFileReady(event) {
        var hash = sha256(event.target.result);
        App.sendHash(hash);
        showHash(hash);
        App.getMetadata(hash).then( data => {
          downloadMode(data) // if there is metadatas, turn widget into download mode
        }, () => {
          updateMode() // otherwise, turn into update metadata mode
        })
    }

    function downloadMode(data){
      publicData = JSON.parse(data.public)
      $('#inputAuthor').value = publicData.author
      $('#inputAuthor').readOnly = true
      $('#inputVersion').value = publicData.version
      $('#inputVersion').readOnly = true
      $('#inputDescription').innerText = publicData.description
      $('#inputDescription').readOnly = true

      $("#uploadFileCheck").closest('.form-group').remove()
      if (publicData.url) {
        // document.getElementById("update").id = "download";
        document.getElementById("update").innerHTML = "Download";
        document.getElementById("update").setAttribute('data-url', publicData.url)
        document.getElementById("update").removeEventListener('click', update);

        document.getElementById("update").addEventListener("click", evt => {
            evt.preventDefault();
            App.download();
        });
      } else {
        $("#update").remove()
      }
    }

    function updateMode() {
      $("#update").addEventListener("click", evt => {
        evt.preventDefault();
        App.updateMetadata();
      });
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
