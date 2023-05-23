const usersQueries = {
  findByEmail: (email) => {
    return {
      name: "fetch-user",
      text: "SELECT * FROM users WHERE email = $1",
      values: [email],
    };
  },

  findById: (id) => {
    return {
      name: "fetch-user",
      text: "SELECT * FROM users WHERE id = $1",
      values: [Number(id)],
    };
  },
};

module.exports = usersQueries;
