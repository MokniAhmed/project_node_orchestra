function getRandomUsersBygroup(listUsers, groupDetails) {
  const selectedUsers = [];
  groupDetails.forEach((group) => {
    const groupName = group.name;
    const groupPercentage = group.pourcentage;
    const groupUsers = listUsers.filter(
      (user) => user.group_pupitre === groupName
    );

    if (groupUsers.length > 0) {
      const numUserToSelect = Math.ceil(
        groupUsers.length * (groupPercentage / 100)
      );
      if (numUserToSelect === groupUsers.length) {
        selectedUsers.push(...groupUsers);
      } else if (numUserToSelect > 0) {
        const randomUsers = [];
        while (randomUsers.length < numUserToSelect) {
          const randomUser =
            groupUsers[Math.floor(Math.random() * groupUsers.length)];
          if (!randomUsers.includes(randomUser)) {
            randomUsers.push(randomUser);
          }
        }
        selectedUsers.push(...randomUsers);
      }
    }
  });

  return selectedUsers;
}
module.exports = getRandomUsersBygroup;
