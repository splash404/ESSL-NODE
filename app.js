const cron = require("node-cron");
const sql = require("mssql");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const moment = require("moment");

const config = {
  user: "sa",
  password: "sa",
  server: "localhost",
  database: "etimetracklitenew",
  options: {
    encrypt: false, // You may need to change this based on your SQL Server configuration
  },
};

const generateCsv = async () => {
  try {
    const pool = await sql.connect(config);
    const columnsResult = await pool
      .request()
      .query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'your_table_name'");
    
    // Extract column names from the query result
    const columnNames = columnsResult.recordset.map((row) => row.COLUMN_NAME);

    const timestamp = moment().format("YYYYMMDD_HHmmss"); // Current timestamp
    const filename = `table_data_${timestamp}.csv`; // Dynamically generate filename
    
    const csvWriter = createCsvWriter({
      path: filename, // CSV file with timestamp in the filename
      header: columnNames.map((columnName) => ({
        id: columnName,
        title: columnName,
      })), // Dynamically generate header based on column names
    });

    const dataResult = await pool.request().query("SELECT * FROM your_table_name");
    
    // Extract data from the query result
    const dataToWrite = dataResult.recordset;

    // Write data to CSV file
    await csvWriter.writeRecords(dataToWrite);
    
    console.log(`CSV file (${filename}) created successfully.`);
  } catch (err) {
    console.error("Error generating CSV:", err.message);
  }
};

// Schedule the cron job to run every minute
cron.schedule("* * * * *", () => {
  console.log("Running the cron job to generate CSV...");
  generateCsv();
});
