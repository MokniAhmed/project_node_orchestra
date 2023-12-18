const dotenv = require("dotenv");
// eslint-disable-next-line
const { faker } = require("@faker-js/faker");
const dbConnection = require("../config/database"); // Assuming your dbConnection module is in the same directory

const User = require("../models/userModel"); // Adjust the path based on your actual file structure
const Historic = require("../models/historicModel");
const Repetition = require("../models/repetitionModel");
const Concert = require("../models/concertModel");
const Music = require("../models/musicalModel");

dotenv.config({ path: "config.env" });
dbConnection(); // Establish database connection
const importData = async () => {
  try {
    // Create an admin user
    await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "adminadmin@gmail.com",
      password: "admin",
      role: "admin",
      phone: faker.phone.imei(),
      cin: faker.number.int({ min: 100000, max: 999999 }),
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
        phone: faker.phone.imei(),
        cin: faker.number.int({ min: 100000, max: 999999 }),
        password: "chefpupitre123",
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

    const numberOfChorists = 40;
    const choristUsers = faker.helpers.multiple(
      () => ({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: "chorist123",
        role: "chorist",
        phone: faker.phone.imei(),
        cin: faker.number.int({ min: 100000, max: 999999 }),
        address: faker.location.streetAddress(),
        group_pupitre: faker.helpers.arrayElement(groups),
        nationality: faker.location.country(),
        tessiture_vocale: faker.music.songName(),
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
const importMusicData = async () => {
  try {
    const groups = ["first", "second", "third", "fourth"];
    const music = faker.helpers.multiple(
      () => ({
        title: faker.music.songName(),
        composator: faker.person.lastName(),
        genre: faker.music.genre(),
        lyrics: faker.lorem.text(),
        arrangeurs: faker.lorem.text(),
        part_choeur: faker.datatype.boolean(),
        presence_Choeur: faker.datatype.boolean(0.9),
        pupitre: faker.helpers.arrayElements(groups),
        nationality: faker.location.country(),
        tessiture_vocale: faker.music.songName(),
        gender: faker.person.sexType(),
        height: faker.number.int({ min: 150, max: 200 }), // Adjust the range as needed
        date_composition: faker.date.past(),
      }),
      {
        count: 30,
      }
    );
    await Music.create(music);
    console.log("Data import successful!");
    process.exit();
  } catch (err) {
    console.error("Data import failed:", err);
    process.exit(1);
  }
};
const deleteData = async () => {
  try {
    // await User.deleteMany();
    //await Historic.deleteMany();
    // await Concert.deleteMany();
    // await Repetition.deleteMany();
    await Music.deleteMany();
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
} else if (process.argv[2] === "--import-music") {
  importMusicData();
}
