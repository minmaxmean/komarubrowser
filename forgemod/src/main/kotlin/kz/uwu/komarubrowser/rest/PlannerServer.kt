package kz.uwu.komarubrowser.rest

import com.sun.net.httpserver.HttpServer
import java.net.InetSocketAddress
import java.net.URLDecoder
import java.nio.charset.StandardCharsets
import kz.uwu.komarubrowser.search.search
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

          // Endpoint: /api/search
          createContext("/api/search") { exchange ->
            val queryParams = parseQueryParams(exchange.requestURI.query ?: "")
            val searchTerm = queryParams["q"] ?: ""

            val results = search(searchTerm)

            // For a real mod, use a JSON library like Gson or kotlinx.serialization
            // For now, we'll manually format a simple JSON list
            val jsonResponse =
                results.joinToString(prefix = "[", postfix = "]", separator = ",") {
                  """{"id":"${it.id}","name":"${it.displayName}","type":"${it.type}","tags":${it.tags.map { t -> "\"$t\"" }}}"""
                }

            sendResponse(exchange, jsonResponse)
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
}

private fun parseQueryParams(query: String): Map<String, String> {
  return query
      .split("&")
      .filter { it.contains("=") }
      .associate {
        val parts = it.split("=")
        val key = URLDecoder.decode(parts[0], "UTF-8")
        val value = URLDecoder.decode(parts[1], "UTF-8")
        key to value
      }
}

private fun sendResponse(exchange: com.sun.net.httpserver.HttpExchange, response: String) {
  val bytes = response.toByteArray(StandardCharsets.UTF_8)
  exchange.responseHeaders.add("Content-Type", "application/json")
  exchange.sendResponseHeaders(200, bytes.size.toLong())
  exchange.responseBody.use { it.write(bytes) }
}
