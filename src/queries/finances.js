const financesQueries = {
  findById: (id) => {
    return {
      name: "fetch-finance",
      text: "SELECT * FROM finances WHERE id = $1",
      values: [Number(id)],
    };
  },
};

module.exports = financesQueries;
