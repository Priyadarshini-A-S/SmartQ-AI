// In-memory QueueState store — replaces Mongoose model
const states = new Map();

const key = (centerName, queueDate) => `${centerName}::${queueDate}`;

export const QueueState = {
  findOneAndUpdate({ centerName, queueDate }, update, opts = {}) {
    const k = key(centerName, queueDate);
    let doc = states.get(k);

    if (!doc) {
      if (!opts.upsert) return Promise.resolve(null);
      doc = {
        centerName,
        queueDate,
        nowServing: 0,
        nextTokenNumber: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      // apply $setOnInsert
      if (update.$setOnInsert) Object.assign(doc, update.$setOnInsert);
      states.set(k, doc);
    }

    if (update.$inc) {
      for (const [field, val] of Object.entries(update.$inc)) doc[field] = (doc[field] || 0) + val;
    }
    if (update.$set) Object.assign(doc, update.$set);
    doc.updatedAt = new Date();

    return Promise.resolve(opts.new !== false ? doc : { ...doc });
  },

  findOne({ centerName, queueDate }) {
    return Promise.resolve(states.get(key(centerName, queueDate)) ?? null);
  },

  // Used by advanceQueue via getOrCreateQueueState then doc.save()
  _getDoc(centerName, queueDate) {
    const k = key(centerName, queueDate);
    let doc = states.get(k);
    if (!doc) {
      doc = { centerName, queueDate, nowServing: 0, nextTokenNumber: 1, createdAt: new Date(), updatedAt: new Date() };
      states.set(k, doc);
    }
    doc.save = () => { doc.updatedAt = new Date(); return Promise.resolve(doc); };
    return doc;
  }
};
