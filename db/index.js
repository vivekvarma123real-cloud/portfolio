function getAdapter() {
  const dbType = (process.env.DB_TYPE || "file").toLowerCase();

  if (dbType === "mysql") {
    return require("./mysql");
  }

  if (dbType === "postgresql" || dbType === "postgres") {
    return require("./postgres");
  }

  if (dbType === "mongodb" || dbType === "mongo") {
    return require("./mongo");
  }

  return require("./file");
}

module.exports = getAdapter();
