package bot.jarvis.coc.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import bot.jarvis.coc.core.BotEngine
import kotlinx.coroutines.launch

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Dashboard : Screen("dashboard", "Dashboard", Icons.Default.Home)
    object Logs : Screen("logs", "Logs", Icons.Default.List)
    object Settings : Screen("settings", "Settings", Icons.Default.Settings)
}

@Composable
fun MainScreen(engine: BotEngine) {
    val navController = rememberNavController()
    val items = listOf(Screen.Dashboard, Screen.Logs, Screen.Settings)
    
    // Simple state to track current screen for BottomBar highlight (NavHostController integration is better but this is quick)
    var currentRoute by remember { mutableStateOf(Screen.Dashboard.route) }

    Scaffold(
        bottomBar = {
            NavigationBar {
                items.forEach { screen ->
                    NavigationBarItem(
                        icon = { Icon(screen.icon, contentDescription = screen.title) },
                        label = { Text(screen.title) },
                        selected = currentRoute == screen.route,
                        onClick = {
                            currentRoute = screen.route
                            navController.navigate(screen.route) {
                                popUpTo(navController.graph.startDestinationId)
                                launchSingleTop = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Dashboard.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Dashboard.route) { DashboardScreen(engine) }
            composable(Screen.Logs.route) { LogsScreen() }
            composable(Screen.Settings.route) { SettingsScreen() }
        }
    }
}

@Composable
fun DashboardScreen(engine: BotEngine) {
    BotControlPanel(engine)
}

@Composable
fun LogsScreen() {
    val logs by bot.jarvis.coc.core.LogManager.logs.collectAsState()
    
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(logs) { log ->
            Column {
                Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                    Text(
                        text = log.formattedTime,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.secondary
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "[${log.level}]",
                        style = MaterialTheme.typography.labelSmall,
                        color = when(log.level) {
                            bot.jarvis.coc.core.LogLevel.ERROR -> MaterialTheme.colorScheme.error
                            bot.jarvis.coc.core.LogLevel.WARN -> androidx.compose.ui.graphics.Color(0xFFFFA000)
                            else -> MaterialTheme.colorScheme.primary
                        }
                    )
                }
                Text(
                    text = log.message, 
                    style = MaterialTheme.typography.bodyMedium
                )
            }
            Divider(color = MaterialTheme.colorScheme.surfaceVariant, modifier = Modifier.padding(top = 8.dp))
        }
    }
}

@Composable
fun SettingsScreen() {
    val context = androidx.compose.ui.platform.LocalContext.current
    val scope = rememberCoroutineScope()
    val settingsRepo = remember { bot.jarvis.coc.core.SettingsRepository(context) }
    
    val rootEnabled by settingsRepo.rootEnabled.collectAsState(initial = false)
    val debugMode by settingsRepo.debugMode.collectAsState(initial = true)

    Column(modifier = Modifier.padding(16.dp)) {
        Text("Settings", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
        ) {
            Column {
                Text("Use Root Access", style = MaterialTheme.typography.titleMedium)
                Text("Requires SuperUser permission", style = MaterialTheme.typography.bodySmall)
            }
            Switch(
                checked = rootEnabled, 
                onCheckedChange = { 
                    scope.launch { settingsRepo.setRootEnabled(it) }
                }
            )
        }
        
        Divider(modifier = Modifier.padding(vertical = 16.dp))
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
        ) {
            Column {
                Text("Debug Mode", style = MaterialTheme.typography.titleMedium)
                Text("Save screenshots & verbose logs", style = MaterialTheme.typography.bodySmall)
            }
            Switch(
                checked = debugMode, 
                onCheckedChange = { 
                    scope.launch { settingsRepo.setDebugMode(it) }
                }
            )
        }
    }
}
