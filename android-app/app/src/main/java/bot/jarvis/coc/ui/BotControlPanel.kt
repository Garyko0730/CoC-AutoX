package bot.jarvis.coc.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import bot.jarvis.coc.core.BotEngine
import bot.jarvis.coc.core.BotState

@Composable
fun BotControlPanel(engine: BotEngine) {
    val state by engine.state.collectAsState()

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        elevation = CardDefaults.cardElevation(8.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Jarvis CoC Bot",
                style = MaterialTheme.typography.headlineMedium
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = "Status: ${state::class.simpleName}")
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { engine.start() }) {
                    Text("Start")
                }
                Button(
                    onClick = { engine.stop() },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Stop")
                }
            }
        }
    }
}
