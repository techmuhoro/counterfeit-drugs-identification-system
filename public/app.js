if(document.getElementById("header-accouunt-icon")) {
    document.getElementById("header-accouunt-icon").addEventListener("click", function(e) {
        document.getElementById("header-account-dropdown").classList.toggle("show");
    });
}

/**
 * ! Uncomment script line in head for this package to work
 * TODO: require the qr  code scanner
 * 
 */


const html5QrCode = new Html5Qrcode(/* element id */ "reader");
// File based scanning
const fileinput = document.getElementById('qr-input-file');
fileinput.addEventListener('change', e => {
  if (e.target.files.length == 0) {
    // No file selected, ignore 
    return;
  }

  const imageFile = e.target.files[0];
  // Scan QR Code
  html5QrCode.scanFile(imageFile, true)
  .then(decodedText => {

    // extract serial from the url
    const serial = decodedText.substr(decodedText.indexOf("=")+1);
    document.getElementById("serial-input").value = serial;

  })
  .catch(err => {

    // failure, handle it.
    console.log(`Error scanning file. Reason: ${err}`)
    
  });
});

/**
 * 
 * Code for searchable text input
 * 
 */

const shieldIcon = document.getElementById("shield-icon");


// select the input
async function searchableInput() {
  if(
      document.getElementById("endpoint-pharmacy")
      &&
      document.getElementById("search-drop")
      &&
      document.getElementById("list-container")
  ){
    // select the input
    const input = document.getElementById("endpoint-pharmacy");
    const searchDrop = document.getElementById("search-drop");
    const listContainer = document.getElementById("list-container");

    // fect the items
    const response = await fetch("/pharmacies");
    const pharmacies = await response.json();

    const appendToDropdown = (lists) => {
      let html = ""
      lists.forEach(list => {
        html += `<li class="list-drop border-b border-gray-300 py-2 mb-2 cursor-pointer" data-name="${list.name}" data-email="${list.email}">${list.name}</li>`
      })

      return html;
    }

    const bindLists = () => {
      const lists = document.querySelectorAll("#list-container .list-drop");
      lists.forEach(list => {
        list.addEventListener("click", listClickListener);
      });
    }

    function listClickListener(e) {
      const email = e.target.dataset.email;
      input.value = email;
    }

    listContainer.innerHTML = appendToDropdown(pharmacies);
    bindLists();

    // add the event listener
    input.addEventListener("focus", function displayDropList() {
      // display the dropdown
      if(searchDrop.classList.contains("hidden")) {
        searchDrop.classList.remove("hidden");
        searchDrop.classList.add("block");
      }
    })

    input.addEventListener("blur", function hideDropList() {
      // hidden the dropdown
      setTimeout(()=> {
        if(searchDrop.classList.contains("block")) {
          searchDrop.classList.remove("block");
          searchDrop.classList.add("hidden");
        }
      }, 300)
    });

    // listContainer.addEventListener("click", function(e) {
    //   alert("James Muhoro, best software engineer in the world");
    // });

    input.addEventListener("keyup", function filterPharmacies(e) {
      let pharmaciesCopy = [...pharmacies]

      const searchStr = e.target.value.toLowerCase();

      pharmaciesCopy = pharmaciesCopy.filter(item => {
        
        if(item.name.toLowerCase().indexOf(searchStr) === -1) return false;
        return true;

      });

      const strToRender = appendToDropdown(pharmaciesCopy);

      listContainer.innerHTML = strToRender;
      bindLists();

    });
  }
}

searchableInput();