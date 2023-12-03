const xlsx = require("xlsx");

exports.converExcelToJson = (path) => {
  const work = xlsx.readFile(path);
  const sheetname = work.SheetNames[0];
  const musicalList = xlsx.utils.sheet_to_json(work.Sheets[sheetname]);
  console.log(musicalList);
  return musicalList;
};
