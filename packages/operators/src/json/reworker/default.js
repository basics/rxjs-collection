export const defaultReworker = [
  {
    type: Array,
    transform: async (key, value, rework, reworker) => [
      [
        key,
        Array.from(
          await Promise.all(value.map((entry, key) => rework(key, entry, reworker))),
          ([[, value]]) => value
        )
      ]
    ]
  },
  {
    type: Object,
    transform: async (key, value, rework, reworker) => [
      [
        key,
        Object.fromEntries(
          await Object.entries(value).reduce(async (accumulator, [key, value]) => {
            return [...(await accumulator), ...(await rework(key, await value, reworker))];
          }, Promise.resolve([]))
        )
      ]
    ]
  }
];

export const defaultSerializeReworker = defaultReworker;
export const defaultDeserializeReworker = defaultReworker;
