import Counter from "./counter.model";

export const getNextSequence = async (name: string) => {
  const counter = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true },
  );

  return counter.sequence;
};
