const socket = io();

const $messageForm = document.getElementById("message-form");
const $messageInput = $messageForm.querySelector("input");
const $messageFormBtn = $messageForm.querySelector("button");
const $locationButton = document.getElementById("share-location");

socket.on("message", (msg) => {
  console.log(msg);
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
