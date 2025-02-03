import winston, { Logger } from 'winston';
import { ElasticsearchTransformer, ElasticsearchTransport, LogData, TransformedData } from 'winston-elasticsearch';

const esTransformer = (logData: LogData): TransformedData => {
  return ElasticsearchTransformer(logData);
}

export const winstonLogger = (elasticsearchNode: string, name: string, level: string): Logger => {
  const options = {
    console: {
      level, // Logging level (e.g., "info", "error", "debug", etc.)
      handleExceptions: true, // Automatically handle uncaught exceptions
      json: false, // Log output as plain text instead of JSON
      colorize: true // Enable colors in the console output for better readability
    },
    elasticsearch: {
      level, // Logging level for Elasticsearch
      transformer: esTransformer, // Function to transform log data before sending it to Elasticsearch
      clientOpts: {
        node: elasticsearchNode, // The URL of the Elasticsearch node
        log: level, // Logging level for Elasticsearch client
        maxRetries: 2, // Number of retries if the connection fails
        requestTimeout: 10000, // Request timeout in milliseconds (10 seconds)
        sniffOnStart: false // Do not perform sniffing (auto-detection of cluster nodes) on startup
      }
    }
  };

  // Create an Elasticsearch transport for logging
  const esTransport: ElasticsearchTransport = new ElasticsearchTransport(options.elasticsearch);

  // Create a Winston logger with both console and Elasticsearch transports
  const logger: Logger = winston.createLogger({
    exitOnError: false, // Do not exit the application on logger errors
    defaultMeta: { service: name }, // Attach service name as metadata to all logs
    transports: [
      new winston.transports.Console(options.console), // Log to the console
      esTransport // Log to Elasticsearch
    ]
  });

  return logger; // Return the configured logger instance
};

