const socket = io();

const $messageForm = document.getElementById("message-form");
const $messageInput = $messageForm.querySelector("input");
const $messageFormBtn = $messageForm.querySelector("button");
const $locationButton = document.getElementById("share-location");
const $messageBox = document.getElementById("message-inbox");
const $msgScriptBox = document.getElementById("message-template");
const $locationScriptBox = document.getElementById("location-template");

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.on("message", (msg) => {
  console.log(msg);
  const html = Mustache.render($msgScriptBox.innerHTML, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format("h:mm a"),
  });

  $messageBox.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", (msg) => {
  const html = Mustache.render($locationScriptBox.innerHTML, {
    username: msg.username,
    link: msg.text,
    createdAt: moment(msg.createdAt).format("h:mm a"),
  });
  $messageBox.insertAdjacentHTML("beforeend", html);
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
