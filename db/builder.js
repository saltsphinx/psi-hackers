const pool = require("./pool.js");

const builder = () => {
  const queryObj = {
    select: "*",
    from: "",
    where: "",
  };

  const select = function (val) {
    queryObj.select = val;
    return this;
  };

  const from = function (val) {
    queryObj.from = val;
    return this;
  };

  const where = function (val) {
    queryObj.where = val;
    return this;
  };

  const buildQuery = function () {
    if (!queryObj.select)
      throw new Error('"SELECT" statement must defined in SQL Query.');
    if (!queryObj.from)
      throw new Error('"FROM" statement must defined in SQL Query.');

    return `SELECT ${queryObj.select} FROM ${queryObj.from} ${
      queryObj.where ? `WHERE ${queryObj.where}` : ""
    }`;
  };

  const excute = function (arr) {
    const query = buildQuery();
    const hasArgs = arr ? true : false;

    if (!hasArgs) arr = [];

    if (queryObj.where && !hasArgs)
      throw new Error(
        'Parameters must be provided when "WHERE" statement is defined.'
      );

    if (hasArgs && !Array.isArray(arr)) {
      arr = Array.from(arguments);
    }

    const notAlphanum = arr.find(
      (val) => typeof val !== "string" && typeof val !== "number"
    );
    if (notAlphanum)
      throw new Error('"excuteWith" parameters must be strings or numbers');

    return pool.query(query, arr);
  };

  return {
    select,
    from,
    where,
    buildQuery,
    excute,
  };
};

async function run() {
  const build = builder();
  build.from("users").where("id = $1");

  const { rows } = await build.excute();

  console.log(rows[0]);
}

run();
