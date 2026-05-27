// In-memory Token store — replaces Mongoose model
const tokens = new Map();

export const Token = {
  create(data) {
    const doc = { ...data, createdAt: new Date(), updatedAt: new Date() };
    tokens.set(data.tokenId, doc);
    return Promise.resolve(doc);
  },
  findOne(query) {
    for (const doc of tokens.values()) {
      if (Object.entries(query).every(([k, v]) => doc[k] === v)) return Promise.resolve(doc);
    }
    return Promise.resolve(null);
  },
  findOneAndUpdate(query, update) {
    for (const doc of tokens.values()) {
      if (Object.entries(query).every(([k, v]) => doc[k] === v)) {
        const set = update.$set || {};
        Object.assign(doc, set, { updatedAt: new Date() });
        return Promise.resolve(doc);
      }
    }
    return Promise.resolve(null);
  },
  countDocuments(query) {
    let count = 0;
    for (const doc of tokens.values()) {
      if (Object.entries(query).every(([k, v]) => doc[k] === v)) count++;
    }
    return Promise.resolve(count);
  }
};
