
// globals
var currentChannel, currentArtist, currentTrack;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === "get_info") {
            sendResponse({ 
                channel: currentChannel, 
                artist: currentArtist, 
                track: currentTrack
            });
        }
    }
);

var trackNode = document.getElementsByTagName("body")[0];
var config = { attributes: true, childList: true, subtree: true };

var channelCallback = function(mutationsList, observer) {
  currentChannel = mutationsList[0].target.textContent.trim();
  console.log("** Channel: " + currentChannel);
};

var artistCallback = function(mutationsList, observer) {
  currentArtist = mutationsList[0].target.textContent.trim();
  console.log("** Artist: " + currentArtist);
};

var trackCallback = function(mutationsList, observer) {
  currentTrack = mutationsList[0].target.textContent.trim();
  console.log("** Track: " + currentTrack);
};

var callback = function(mutationsList, observer) {
  for (var mutation of mutationsList) {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {

        if (mutation.addedNodes[0].className === "channel-number") {
          var node = mutation.addedNodes[0];

          currentChannel = node.textContent ? node.textContent.trim() : undefined;

          var channelObserver = new MutationObserver(channelCallback);
          channelObserver.observe(node, 
            {childList: true, characterData: true, attributes: true, subtree: true});

        } else if (mutation.addedNodes[0].className === "artist-name") {
          var node = mutation.addedNodes[0];

          currentArtist = node.textContent ? node.textContent.trim() : undefined;

          var artistObserver = new MutationObserver(artistCallback);
          artistObserver.observe(node, 
            {childList: true, characterData: true, attributes: true, subtree: true});

        } else if (mutation.addedNodes[0].className === "track-name") {
          var node = mutation.addedNodes[0];

          currentTrack = node.textContent ? node.textContent.trim() : undefined;

          var trackObserver = new MutationObserver(trackCallback);
          trackObserver.observe(node, 
            {childList: true, characterData: true, attributes: true, subtree: true});
        }
      }
    }
};

var observer = new MutationObserver(callback);

observer.observe(trackNode, config);

