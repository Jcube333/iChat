//addUser,removeUser getUser, getUsersInRoom
const users = [];

//Random Color generator
function getRandomColor() {
  let color = "hsl(" + Math.random() * 360 + ", 100%, 75%)";
  return color;
}

export const addUser = ({ id, username, room }) => {
  //Data cleaning
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //Data Validation
  if (!username || !room) {
    return {
      error: "Username and room is required",
    };
  }

  const isDuplicate = users.find((user) => {
    return user.room === room && user.username === username;
  });

  if (isDuplicate) {
    return {
      error: "Username already in use!",
    };
  }

  const user = { id, username, room };
  users.push(user);
  return { user };
};

export const removeUser = (id) => {
  const userIndex = users.findIndex((user) => user.id === id);

  if (userIndex != -1) {
    const removedUser = users.splice(userIndex, 1)[0];
    return removedUser;
  }
};

export const getUser = (id) => {
  const queriedUser = users.find((user) => user.id === id);

  return queriedUser;
};

export const getUsersInRoom = (room) => {
  const usersInRoom = [];

  users.forEach((user) => {
    if (user.room === room)
      usersInRoom.push({
        ...user,
        initial: user.username[0].toUpperCase(),
        color: getRandomColor(),
      });
  });

  return usersInRoom;
};
