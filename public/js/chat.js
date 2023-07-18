const socket = io();

//$ denotes elements
const $messageForm = document.getElementById("message-form");
const $messageInput = $messageForm.querySelector("input");
const $messageFormBtn = $messageForm.querySelector("button");
const $locationButton = document.getElementById("share-location");
const $messageBox = document.getElementById("message-inbox");
const $sidebarUser = document.getElementById("userBox");
const $msgScriptBox = document.getElementById("message-template");
const $locationScriptBox = document.getElementById("location-template");
const $sideBarScriptBox = document.getElementById("sidebar-template");

const autoscroll = () => {
  //Most recent message Element and its height with margin
  const $newMessage = $messageBox.lastElementChild;

  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //Currently visible height..fixed as per view
  const visible = $messageBox.offsetHeight;

  //Complete Height of message Container
  const containerHeight = $messageBox.scrollHeight;

  //Where am i currently located?
  const currPosition = $messageBox.scrollTop + visible;

  //scrollOffset= height till top end of scrollBar + current visible ht
  //i.e. scrollOffset=height till current position on page.

  if (containerHeight - newMessageHeight <= currPosition) {
    $messageBox.scrollTop = $messageBox.scrollHeight;
  }
};

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.on("message", (msg) => {
  console.log(msg);

  //Compiled HTML by Mustache after relevant insertions
  const html = Mustache.render($msgScriptBox.innerHTML, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format("h:mm a"),
  });

  $messageBox.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", (msg) => {
  const html = Mustache.render($locationScriptBox.innerHTML, {
    username: msg.username,
    link: msg.text,
    createdAt: moment(msg.createdAt).format("h:mm a"),
  });
  $messageBox.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

//Sidebar User's List
socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render($sideBarScriptBox.innerHTML, {
    room,
    users,
  });
  $sidebarUser.innerHTML = html;
});

//Form Submit Event
$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormBtn.setAttribute("disabled", "disabled");

  //using name property on input field
  const message = e.target.elements.message.value;

  socket.emit("newMessage", message, () => {
    $messageFormBtn.removeAttribute("disabled");
    $messageInput.focus();
    $messageInput.value = "";
    console.log("Delivered");
  });
});

//Share location Event
$locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Your browser doesn't support this feature");
  }
  $locationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    return socket.emit(
      "sendLocation",
      { lat: position.coords.latitude, long: position.coords.longitude },
      (ack_msg) => {
        $locationButton.removeAttribute("disabled");
        console.log(ack_msg);
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
