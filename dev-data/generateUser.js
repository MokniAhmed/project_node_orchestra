const dotenv = require("dotenv");
// eslint-disable-next-line
const { faker } = require("@faker-js/faker");
const dbConnection = require("../config/database"); // Assuming your dbConnection module is in the same directory

const User = require("../models/userModel"); // Adjust the path based on your actual file structure

dotenv.config({ path: "config.env" });
const importData = async () => {
  try {
    dbConnection(); // Establish database connection

    // Create an admin user
    await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "adminadmin@gmail.com",
      password: "admin",
      role: "admin",
      address: faker.location.streetAddress(),
      nationality: faker.location.country(),
      gender: faker.person.sexType(),
      height: faker.number.int({ min: 150, max: 200 }), // Adjust the range as needed
      birthday: faker.date.past(),
    });

    // Create chef_pupitre users for each group
    const groups = ["first", "second", "third", "fourth"];
    const chefPupitreUsers = faker.helpers.multiple(
      () => ({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: "chef_pupitre",
        group_pupitre: faker.helpers.arrayElement(groups),
        address: faker.location.streetAddress(),
        nationality: faker.location.country(),
        gender: faker.person.sexType(),
        height: faker.number.int({ min: 150, max: 200 }), // Adjust the range as needed
        birthday: faker.date.past(),
      }),
      {
        count: groups.length,
      }
    );

    await User.create(chefPupitreUsers, { validateBeforeSave: false });

    const numberOfChorists = 20;
    const choristUsers = faker.helpers.multiple(
      () => ({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: "chorist",
        address: faker.location.streetAddress(),
        nationality: faker.location.country(),
        gender: faker.person.sexType(),
        height: faker.number.int({ min: 150, max: 200 }), // Adjust the range as needed
        birthday: faker.date.past(),
      }),
      {
        count: numberOfChorists,
      }
    );

    await User.create(choristUsers, { validateBeforeSave: false });
    console.log("Data import successful!");
    process.exit();
  } catch (err) {
    console.error("Data import failed:", err);
    process.exit(1);
  }
};
const deleteData = async () => {
  try {
    await User.deleteMany();
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
