function needstobesaved(theStr){
  var blackList = settings['listBlack'];
  var whiteList = settings['listWhite'];
  var matchWords = settings['match_words'];
  var blacklisted = false;
  var whitelisted = false;
  
  for(var i=0;i<whiteList.length;i++) {
    if(theStr.toLowerCase().indexOf(whiteList[i].toLowerCase())>=0) {
      whitelisted = true;
    }
  }

  if (!whitelisted) {
    for(var i=0;i<blackList.length;i++) {
      if (matchWords) {
        var filterRegex;
        filterRegex='(^|\\W)('+blackList[i].toLowerCase().replace(/\x2a/g, "(\\w*?)")+')(\\W|$)';
        var re = new RegExp(filterRegex);
        if (theStr.toLowerCase().match(re)) {
          blacklisted = true;
        }
      } else {
        if(theStr.toLowerCase().indexOf(blackList[i].toLowerCase())>=0) {
          blacklisted = true;
        }
      }
    }
  }
  return blacklisted;
}

function addGlobalStyle(css) {
  var elmHead, elmStyle;
  elmHead = document.getElementsByTagName('head')[0];
  elmStyle = document.createElement('style');
  elmStyle.type = 'text/css';
  elmHead.appendChild(elmStyle);
  elmStyle.innerHTML = css;
}

function hide_source() {
  var better_rule = '.source_url {display:none!important;}';
  try {
    document.styleSheets[0].insertRule(better_rule, 0);
  } catch (e) {
    addGlobalStyle(better_rule);
  }
}

var liPosts = document.getElementsByTagName('li');
var last_check = 0;
var anchors = document.getElementsByTagName('a');
var last_anchor = 0;
var settings;

function loadSettings() {
  var defaultSettings = { 'listBlack': ['iphone', 'ipad'], 'listWhite': ['bjorn', 'octopus'], 'hide_source': true, 'show_notice': true, 'no_pagetracker': false, 'match_words': false }; //initialize default values.
	chrome.extension.sendRequest('getSettings', function(response) {
    savedSettings = response.settings;
    if (savedSettings == undefined) {
			settings = defaultSettings;
    } else {
			settings = JSON.parse(savedSettings);
    }
    if (settings['hide_source']=='true'||settings['hide_source']==true) {
      hide_source();
    }
    if (settings['show_notice']=='true'){
      settings['show_notice'] = true;
    }
    if (settings['no_pagetracker']=='true') {
      settings['no_pagetracker'] = true;
    }
    setInterval(check_for_saving, 200);
	});
}
  
function check_for_saving() {
	for (var i=last_check;i<liPosts.length;i++) {
		if (liPosts[i].id.substring(0,4)=='post' && liPosts[i].className.indexOf('not_mine') >= 0) {
			var savedfrom = needstobesaved(liPosts[i].innerHTML);
			if (savedfrom) {
        if (settings['show_notice']) {
          var div_filtered = document.createElement('div');
          div_filtered.style.display = 'none';

          while (liPosts[i].childNodes.length > 1) {
            div_filtered.appendChild(liPosts[i].childNodes[0]);
          }

          var div_notice = document.createElement('div');
          div_notice.className = 'post_info';
          div_notice.innerHTML = 'You have been saved from this post, it had something you didn\'t want to see in it. <a onclick="this.parentNode.style.display=\'none\'; this.parentNode.nextSibling.style.display=\'\'; return false;" href="#"><i>Click here</i></a> if you cannot resist the temptation.';

          liPosts[i].appendChild(div_notice);
          liPosts[i].appendChild(div_filtered);
        } else {
          liPosts[i].style.display = 'none';
        }
			}
		}
	}
	last_check = liPosts.length;

	if (settings['no_pagetracker']) {
    for (var i=last_anchor;i<anchors.length;i++) {
      if (anchors[i].outerHTML.indexOf('pageTracker')>=0) {
        anchors[i].outerHTML=anchors[i].outerHTML.replace(/pageTracker\._trackEvent\(.*\);/gm, " ");
      }
    }
    last_anchor = anchors.length;
  }
}

loadSettings();