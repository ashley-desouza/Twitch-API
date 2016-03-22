var offset = 0;

// Function to invoke when DOM loads
var startHere = function () {
  var searchBtn = document.getElementById('searchBtn'),
      prev = document.getElementById('prev'),
      next = document.getElementById('next'),
      resultCount = document.getElementById('resultCount'),
      searchBox = document.getElementById('searchBox'),
      searchMessage = document.getElementById('searchMessage'),
      streamCount = document.getElementById('streamCount'),
      streamDisplay = document.getElementById('streamDisplay');

  // Event Listeners for 'Search', 'previous' and 'next' button clicks
  searchBox.addEventListener('keypress', keyPressed, false);
  searchBtn.addEventListener('click', makeRequest, false);
  prev.addEventListener('click', getPrevList, false);
  next.addEventListener('click', getNextList, false);
};

// Check if the key pressed is the return key
var keyPressed =  function (event) {
  var event = event || window.event;
  if (event.keyCode === 13) {
    makeRequest();
  }
};

// Previous List of Streams for pagination
var getPrevList = function () {
  if (offset) {
    offset -= 10; // Decrease offset by 10
    resultCount.textContent = (offset + 1) + ' - ' + (offset + 10);
    makeRequest();
  } else {
    return false;
  }
};

// Next list of streams for pagination
var getNextList = function () {
  offset += 10; // Increase offset by 10
  resultCount.textContent = (offset + 1) + ' - ' + (offset + 10);
  makeRequest();
};

// Build the elements for each Stream
var buildELements = function (data, index) {
  var streamListItem = document.createElement('li'),
      streamTitle    = document.createElement('h2'),
      streamLink     = document.createElement('a'),
      img            = new Image(),
      gameName       = document.createElement('div'),
      viewers        = document.createElement('span'),
      desc           = document.createElement('div'),
      views          = document.createElement('div');

  // Get the appropriate information for each elements content
  streamTitle.textContent = data.streams[index].channel.display_name;
  // Set href and target attributes for the streams link
  streamLink.href = data.streams[index].channel.url;
  streamLink.target = '_blank';

  // Set the src (source) attribute for the image
  img.src = data.streams[index].preview.medium;

  gameName.textContent = data.streams[index].game;
  // Add styling to the Game Name
  gameName.className = 'headerStyle';

  // Add styling to the viewers element
  viewers.textContent = ' - ' + data.streams[index].viewers;
  viewers.textContent += data.streams[index].viewers === 1? ' viewer' : ' viewers';
  viewers.className = 'strongStyle';

  desc.textContent = data.streams[index].channel.status;

  // Add styling to the views element
  views.textContent = data.streams[index].channel.views;
  views.textContent += data.streams[index].channel.views === 1? ' view' : ' views';
  views.className = 'strongStyle';

  // Append each child element to its appropriate parent element
  gameName.appendChild(viewers);
  streamLink.appendChild(streamTitle);
  streamListItem.appendChild(img);
  streamListItem.appendChild(streamLink);
  streamListItem.appendChild(gameName);
  streamListItem.appendChild(desc);
  streamListItem.appendChild(views);

  // Return the final 'li' (list item)
  return streamListItem;
};

var makeRequest = function () {
  // Reset the elements on the page -
    // 1. 'Search Error Message', 2. Num of Streams, 3. 'Previous' list for pagination,
    // 4. The Total, 5. 'Next' list for pagination, 6. The list of Streams
  searchMessage.textContent = '';
  streamCount.textContent = '';
  prev.textContent = '';
  resultCount.textContent = '';
  next.textContent = '';
  streamDisplay.innerHTML = '';

  if(searchBox.value.trim().length === 0) {
    searchBox.value = '';
    searchMessage.textContent = 'Please enter a search term.';
  } else {
    // Build url
    var url = 'https://api.twitch.tv/kraken/search/streams?q=' + searchBox.value + '&offset=' + offset + ''

    // Setup the xhr object
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = handler;
    xhr.responseType = 'json';
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send(null);

    function handler() {
      if (this.readyState === 4) {
        if (this.status === 200) {
          var data = xhr.response;
          // Setup new content for the -
            // 1. Num of Streams, 2. 'Previous' list for pagination,
            // 3. The Total, 4. 'Next' list for pagination,
          streamCount.textContent = 'Total Results: ' + data._total;
          prev.textContent = '\u25C4';
          resultCount.textContent = (offset + 1) + ' - ' + (offset + 10);
          next.textContent = '\u25BA';

          var numOfStreams = data.streams.length;

          // If no (zero) streams are returned, display appropriate message to user and stop execution.
          if (numOfStreams === 0) {
              var noStreams = document.createElement('p');
              noStreams.textContent = 'Sorry! No Streams to display!';
              streamDisplay.appendChild(noStreams);
              return false;
          }

          var streamDisplayList = document.createElement('ul');

          for (var i = 0; i < numOfStreams; i++) {
            streamDisplayList.appendChild(buildELements(data, i));
          }
          streamDisplay.appendChild(streamDisplayList);
        } else {
          alert(new Error(url + ' failed with status: ' + this.status + ''));
        }
      }
    };
  }
};

window.addEventListener('load', startHere, false);
