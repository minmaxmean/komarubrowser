package kz.uwu.komarubrowser.rest

import com.google.gson.Gson
import com.sun.net.httpserver.HttpServer
import kz.uwu.komarubrowser.search.getAllGTRecipesWith
import kz.uwu.komarubrowser.search.getAllIngrediens
import kz.uwu.komarubrowser.search.searchItem
import kz.uwu.komarubrowser.search.toJsonElement
import net.minecraft.server.MinecraftServer
import org.apache.logging.log4j.LogManager
import java.net.InetSocketAddress
import java.net.URLDecoder
import java.nio.charset.StandardCharsets

class PlannerServer(
  private val mcServer: MinecraftServer, private val port: Int = 8888
) {
  private var server: HttpServer? = null
  val gson = Gson()

  // the logger for our mod
  private val logger = LogManager.getLogger()

  fun start() {
    // Create a server that listens on localhost
    server = HttpServer.create(InetSocketAddress(port), 0).apply {

      // Endpoint: /api/ping
      createContext("/api/ping") { exchange ->
        val response = """{"status":"ok"}"""
        sendLegacyResponse(exchange, response)
      }

      // Endpoint: /api/searchItem
      createContext("/api/searchItem") { exchange ->
        val queryParams = parseQueryParams(exchange.requestURI.query ?: "")
        val searchTerm = queryParams["q"] ?: ""

        val results = searchItem(searchTerm)

        // For a real mod, use a JSON library like Gson or kotlinx.serialization
        // For now, we'll manually format a simple JSON list
        val jsonResponse = results.joinToString(prefix = "[", postfix = "]", separator = ",") {
          """{"id":"${it.id}","name":"${it.displayName}","type":"${it.type}","tags":${it.tags.map { t -> "\"$t\"" }}}"""
        }

        sendLegacyResponse(exchange, jsonResponse)
      }

      createContext("/api/searchRecipe") { exchange ->
        val queryParams = parseQueryParams(exchange.requestURI.query ?: "")
        val searchTerm = queryParams["q"] ?: ""

        try {
          val recipes = mcServer.recipeManager.getAllGTRecipesWith(searchTerm)

          val jsonResponse = recipes.toJsonElement().toString()
          sendJsonResponse(exchange, jsonResponse)
        } catch (e: Exception) {
          logger.error(e)
        }
      }

      createContext("/api/ingredients") { exchange ->
        val allIngredients = getAllIngrediens()
        sendJsonResponse(exchange,allIngredients)
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

  private fun sendRawResponse(exchange: com.sun.net.httpserver.HttpExchange, contentType: String, response: String) {
    val bytes = response.toByteArray(StandardCharsets.UTF_8)
    exchange.responseHeaders.add("Content-Type", contentType)
    exchange.sendResponseHeaders(200, bytes.size.toLong())
    exchange.responseBody.use { it.write(bytes) }
  }

  private fun sendLegacyResponse(exchange: com.sun.net.httpserver.HttpExchange, response: String) {
    sendRawResponse(exchange, "application/json", response)
  }

  private fun sendJsonResponse(exchange: com.sun.net.httpserver.HttpExchange, response: Any) {
    sendRawResponse(exchange, "application/json", gson.toJson(response))
  }
}

private fun parseQueryParams(query: String): Map<String, String> {
  return query.split("&").filter { it.contains("=") }.associate {
    val parts = it.split("=")
    val key = URLDecoder.decode(parts[0], "UTF-8")
    val value = URLDecoder.decode(parts[1], "UTF-8")
    key to value
  }
}

