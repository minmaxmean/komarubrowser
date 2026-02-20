package kz.uwu.komarubrowser.rest

import com.sun.net.httpserver.HttpServer
import java.net.InetSocketAddress
import java.nio.charset.StandardCharsets
import org.apache.logging.log4j.LogManager

class PlannerServer(private val port: Int = 8888) {
  private var server: HttpServer? = null

  // the logger for our mod
  private val logger = LogManager.getLogger()

  fun start() {
    // Create a server that listens on localhost
    server =
        HttpServer.create(InetSocketAddress(port), 0).apply {

          // Endpoint: /api/ping
          createContext("/api/ping") { exchange ->
            val response = """{"status":"ok"}"""
            sendResponse(exchange, response)
          }

          // Endpoint: /api/dummy
          createContext("/api/dummy") { exchange ->
            val response =
                """
                {
                                    "machine": "gtceu:macerator",
                                    "output": "gtceu:iron_dust"
                                }
                """
                    .trimIndent()
            sendResponse(exchange, response)
          }

          executor = null // Use default executor
          start()
        }
    logger.info("Minimalist API Server started on port $port")
  }

  fun stop() {
    if (server != null) {
      server?.stop(0)
      logger.info("API Server stopped.")
    }
  }

  private fun sendResponse(exchange: com.sun.net.httpserver.HttpExchange, response: String) {
    val bytes = response.toByteArray(StandardCharsets.UTF_8)
    exchange.responseHeaders.add("Content-Type", "application/json")
    exchange.sendResponseHeaders(200, bytes.size.toLong())
    exchange.responseBody.use { it.write(bytes) }
  }
}
