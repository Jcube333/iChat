const socket = io();

const $messageForm = document.getElementById("message-form");
const $messageInput = $messageForm.querySelector("input");
const $messageFormBtn = $messageForm.querySelector("button");
const $locationButton = document.getElementById("share-location");
const $messageBox = document.getElementById("message-inbox");
const $msgScriptBox = document.getElementById("message-template");
const $locationScriptBox = document.getElementById("location-template");

socket.on("message", (msg) => {
  const html = Mustache.render($msgScriptBox.innerHTML, { message: msg });
  $messageBox.insertAdjacentHTML("beforeend", html);
  console.log(msg);
});

socket.on("locationMessage", (locationURL) => {
  const html = Mustache.render($locationScriptBox.innerHTML, {
    link: locationURL,
  });
  $messageBox.insertAdjacentHTML("beforeend", html);
});

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
