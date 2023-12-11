exports.arrayToJson = (result) => {
  const transformedObject = {};

  result.forEach((item) => {
    const { pupitre, status } = item._id;
    const count = item.count;

    if (!transformedObject[pupitre]) {
      transformedObject[pupitre] = {
        present: 0,
        absent_demanded: 0,
        absent: 0,
        percentage: 0,
      };
    }

    transformedObject[pupitre][status] = count;
  });
  // Calculer le pourcentage de présence
  Object.keys(transformedObject).forEach((pupitre) => {
    const total =
      transformedObject[pupitre].present +
      transformedObject[pupitre].absent_demanded +
      transformedObject[pupitre].absent;

    transformedObject[pupitre].percentage = (
      (transformedObject[pupitre].present / total) *
      100
    ).toFixed(2);
  });

  return transformedObject;
};
