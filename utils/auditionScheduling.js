function getNextAuditionSlot({ planning, audition_starting_date, nb_candidate_day }) {
  if (planning.length === 0) {
    const starting_date = new Date(audition_starting_date);
    starting_date.setHours(9, 0, 0, 0);
    return { starting_date, order: 1 };
  }

  const lastCandidate = planning[planning.length - 1];
  if (lastCandidate.order < nb_candidate_day) {
    return {
      starting_date: new Date(
        lastCandidate.starting_date.getTime() + lastCandidate.duration * 60 * 1000
      ),
      order: lastCandidate.order + 1,
    };
  }

  const starting_date = new Date(lastCandidate.starting_date);
  starting_date.setDate(starting_date.getDate() + 1);
  starting_date.setHours(9, 0, 0, 0);
  return { starting_date, order: 1 };
}

module.exports = getNextAuditionSlot;
