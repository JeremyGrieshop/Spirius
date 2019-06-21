import React, {useEffect, useState} from 'react';
import {
  Button, 
  CircularProgress, 
  Divider,
  Fade,
  IconButton,
  Link,
  Tooltip,
  Typography 
} from "@material-ui/core";

import {
  ArrowBack,
  Clear,
  List,
  OpenInNew,
  PlaylistAdd
} from "@material-ui/icons";

import {makeStyles} from "@material-ui/styles";

import "typeface-roboto";

/*global chrome*/

const useStyles = makeStyles({
  hoverButton: {
    float: "right",
    opacity: "0.25",
    '&:hover': {
      opacity: "1"
    }
  }
});

const App = () => {

  const [channel, setChannel] = useState();
  const [artist, setArtist] = useState();
  const [track, setTrack] = useState();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedItems, setSavedItems] = useState([]);
  const [showList, setShowList] = useState(false);

  const classes = useStyles();

  useEffect(() => {
    const tabQuery = {
      currentWindow: true, url: "https://player.siriusxm.com/*"
    };

    chrome.tabs.query(tabQuery, (tabs) => {
      if (tabs.length > 0) {
        try {
          chrome.tabs.sendMessage(tabs[0].id, {action: "get_info"}, function(response) {
            if (response) {
              setChannel(response.channel);
              setArtist(response.artist);
              setTrack(response.track);
            }
          });
        } catch (error) {}
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.sync.get(["spirius"], (result) => {
      const savedItems = result.spirius ? (result.spirius.items ? result.spirius.items : []) : [];

      setSavedItems(savedItems);
    });
  }, []);

  const onSaveTrack = () => {
    setSaving(true);
    chrome.storage.sync.get(["spirius"], (result) => {
      const currentItems = result.spirius ? (result.spirius.items ? result.spirius.items : []) : [];
      const items = [...currentItems, { channel, artist, track, timestamp: Date.now()}];

      chrome.storage.sync.set({ spirius: { items } }, () => {
        setTimeout(() => {
          setSaved(true);
          setSaving(false);
        }, 500);
        setSavedItems(items);
      });
    });
  };

  const onShowList = () => {
    setShowList(true);
  };

  const onRemoveTrack = (item, index) => {
    let items = savedItems;
    items.splice(index, 1); 

    chrome.storage.sync.set({ spirius: { items } }, () => {
      setSavedItems([...items]);
    });
  };

  if (showList) {
    return (
      <div className="App">
        <div style={{padding: "10px"}}>
          <Typography style={{color: "#1db954"}} variant="h4">Spirius</Typography>
        </div>
        <div style={{width: "400px", maxHeight: "400px", overflow: "auto", padding: "10px"}}>
        { (savedItems.length === 0) ? 
          <div style={{textAlign: "center"}}>
            <Typography variant="caption">You have no saved tracks.</Typography> 
          </div> :
          savedItems.map((item, index) => {
            const date = item.timestamp ? new Date(item.timestamp) : new Date(Date.now().toString());
            return (
              <div key={index} style={{padding: "5px"}}>
                <Tooltip title="Remove Track" enterDelay={500}>
                  <IconButton 
                    className={classes.hoverButton}
                    onClick={() => onRemoveTrack(item, index)}
                  >
                    <Clear color="error" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Find Track in Spotify" enterDelay={500}>
                  <IconButton 
                    className={classes.hoverButton}
                    href={"https://open.spotify.com/search/songs/" + item.artist + " " + item.track}
                    target="_blank"
                  >
                    <OpenInNew />
                  </IconButton>
                </Tooltip>
                <Typography variant="body1">{item.artist}</Typography>
                <Typography variant="body2">{item.track}</Typography>
                <Typography variant="caption" color="textSecondary">{date.toDateString() + " " + date.toLocaleTimeString()}</Typography>
                <Divider />
              </div>
            );
          }) 
        }
        </div>
        <div style={{padding: "10px"}}>
          <Button 
            onClick={() => setShowList(false)}
          >
            <ArrowBack />
            Now Playing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div style={{padding: "10px"}}>
        <Typography style={{color: "#1db954"}} variant="h4">Spirius</Typography>
      </div>
      <div style={{width: "400px", padding: "10px"}}>
      {
        (!channel || !artist || !track) ?
          <>
            <Typography>To get started, launch the player at: </Typography>
            <div style={{height: "20px"}}/>
            <Link target="_blank" href="https://player.siriusxm.com">https://player.siriusxm.com</Link>
            <div style={{height: "20px"}}/>
            <Typography variant="caption">If you are currently running the player, you may need to reload the tab.</Typography>
          </> :
          <>
            <Typography 
              style={{backgroundColor: "#efefef", padding: "5px"}} 
              variant="h6">{channel}</Typography>
            <Typography variant="h4">{artist}</Typography>
            <Typography variant="h5">{track}</Typography>
          </>
      }
        <div style={{height: "40px"}} />
        <div>
        {
          saving ?
            <Fade 
              in={saving}
              timeout={{ enter: 500, exit: 500 }}
              unmountOnExit
            >
              <CircularProgress />
            </Fade> :
            <Tooltip title="Save Track Information" enterDelay={500}>
              <Button 
                component="span"
                onClick={onSaveTrack}
                disabled={!channel || !artist || !track}
              >
                  <PlaylistAdd />
                  Save Track
              </Button>
            </Tooltip>
        }
          <Tooltip title="View Saved Tracks" enterDelay={500}>
            <Button 
              style={{float: "right"}}
              component="span"
              onClick={onShowList}
            >
              <List />
              View List
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

export default App;
