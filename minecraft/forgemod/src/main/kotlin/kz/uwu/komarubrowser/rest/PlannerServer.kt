package kz.uwu.komarubrowser.rest

import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.sun.net.httpserver.HttpExchange
import com.sun.net.httpserver.HttpServer
import kz.uwu.komarubrowser.client.addVisualData
import kz.uwu.komarubrowser.dump.RecipeDTO
import kz.uwu.komarubrowser.dump.getAllIngredient
import kz.uwu.komarubrowser.dump.getAllRecipeMachines
import kz.uwu.komarubrowser.search.getAllGTRecipes
import net.minecraft.client.player.LocalPlayer
import net.minecraft.server.MinecraftServer
import org.apache.http.HttpStatus
import org.apache.logging.log4j.LogManager
import java.net.InetSocketAddress
import java.nio.charset.StandardCharsets
import net.minecraft.client.Minecraft



class PlannerServer(
  private val mcServer: MinecraftServer?, private val port: Int = 8888
) {
  private var server: HttpServer? = null
  val gson: Gson = GsonBuilder().setPrettyPrinting().create()

  // the logger for our mod
  private val logger = LogManager.getLogger()


  fun start() {
    // Create a server that listens on localhost
    server = HttpServer.create(InetSocketAddress(port), 0).apply {

      // Endpoint: /api/ping
      createContext("/api/ping") { exchange ->
        sendJsonResponse(exchange, "ok")
      }

      createContext("/api/ingredients") { exchange ->
        try {
          if (!isClientInGame()) {
            sendError(exchange, Exception("Client needs to join the game first"))
          } else {
            val allIngredients = getAllIngredient()
            allIngredients.forEach { it.addVisualData() }
            logger.info("Found ${allIngredients.size} ingredients")
            sendJsonResponse(exchange, allIngredients)
          }
        } catch (e: Exception) {
          sendError(exchange, e)
        }
      }

      createContext("/api/recipes") { exchange ->
        try {
          check(mcServer != null) { "/api/recipes only available on server side" }
          val recipes = mcServer.recipeManager.getAllGTRecipes().map { RecipeDTO.fromGTRecipe(it) }
          logger.info("Found ${recipes.size} recipes")
          sendJsonResponse(exchange, recipes)
        } catch (e: Exception) {
          sendError(exchange, e)
        }
      }

      createContext("/api/recipeCategories") { exchange ->
        try {
          check(mcServer != null) { "/api/recipeCategories only available on server side" }
          val rm = getAllRecipeMachines()
          logger.info("Found ${rm.machines.size} machines & ${rm.recipeCategories.size} recipeCategories")
          sendJsonResponse(exchange, rm)
        } catch (e: Exception) {
          sendError(exchange, e)
        }
      }

      executor = null // Use default executor
      start()
    }
    logger.info("KomaruBrowser server started on port $port")
  }

  fun stop() {
    if (server != null) {
      server?.stop(0)
      logger.info("API Server stopped.")
    }
  }

  private fun sendError(exchange: HttpExchange, e: Exception) {
    logger.error("Unexpected error", e)
    return sendJsonResponse(exchange, e.localizedMessage, HttpStatus.SC_INTERNAL_SERVER_ERROR)
  }

  private fun sendRawResponse(exchange: HttpExchange, response: String, status: Int) {
    val bytes = response.toByteArray(StandardCharsets.UTF_8)
    exchange.responseHeaders.add("Content-Type", "application/json")
    exchange.sendResponseHeaders(status, bytes.size.toLong())
    exchange.responseBody.use { it.write(bytes) }
  }

  private fun sendJsonResponse(exchange: HttpExchange, response: Any, status: Int = HttpStatus.SC_OK) {
    sendRawResponse(exchange, gson.toJson(response), status)
  }
}


private fun isClientInGame(): Boolean {
  val mc = Minecraft.getInstance()
  if (mc == null) {
    return false
  }
  // Check if the world/level exists. If level is null, you're in the menu.
  return mc.level != null && mc.player != null
}