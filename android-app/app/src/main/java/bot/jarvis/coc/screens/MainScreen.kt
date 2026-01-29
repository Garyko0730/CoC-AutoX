package bot.jarvis.coc.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import bot.jarvis.coc.components.*
import bot.jarvis.coc.core.BotEngine
import bot.jarvis.coc.core.BotState
import bot.jarvis.coc.data.AppDataStore
import bot.jarvis.coc.theme.*
import kotlinx.coroutines.launch

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Dashboard : Screen("dashboard", "Dashboard", Icons.Default.Home)
    object Logs : Screen("logs", "Logs", Icons.Default.List)
    object Settings : Screen("settings", "Settings", Icons.Default.Settings)
}

@Composable
fun MainScreen(
    engine: BotEngine,
    dataStore: AppDataStore,
    onLaunchBot: () -> Unit,
    onNavigateToPicker: () -> Unit
) {
    val navController = rememberNavController()
    val items = listOf(Screen.Dashboard, Screen.Logs, Screen.Settings)
    var currentRoute by remember { mutableStateOf(Screen.Dashboard.route) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(CocBackground)
    ) {
        // Glassmorphism Navigation Bar
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter)
                .glassmorphism(
                    backgroundColor = CocGlass,
                    borderColor = CocNeonCyan,
                    cornerRadius = 24
                )
                .neonGlow(glowColor = CocNeonCyan),
            shape = androidx.compose.foundation.shape.RoundedCornerShape(24.dp, 24.dp, 0.dp, 0.dp),
            colors = CardDefaults.cardColors(containerColor = Color.Transparent)
        ) {
            NavigationBar(
                containerColor = Color.Transparent,
                contentColor = CocNeonCyan
            ) {
                items.forEach { screen ->
                    NavigationBarItem(
                        icon = { NeonIcon(icon = screen.icon, glowColor = if (currentRoute == screen.route) CocNeonCyan else CocTextSecondary) },
                        label = { 
                            Text(
                                text = screen.title,
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = if (currentRoute == screen.route) CocNeonCyan else CocTextSecondary,
                                    fontFamily = JetBrainsMono
                                )
                            )
                        },
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

        // Main Content
        NavHost(
            navController = navController,
            startDestination = Screen.Dashboard.route,
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 80.dp)
        ) {
            composable(Screen.Dashboard.route) {
                DashboardScreen(
                    engine = engine,
                    dataStore = dataStore,
                    onLaunchBot = onLaunchBot,
                    onNavigateToPicker = onNavigateToPicker
                )
            }
            composable(Screen.Logs.route) { LogsScreen() }
            composable(Screen.Settings.route) { SettingsScreen(dataStore) }
        }
    }
}

@Composable
fun DashboardScreen(
    engine: BotEngine,
    dataStore: AppDataStore,
    onLaunchBot: () -> Unit,
    onNavigateToPicker: () -> Unit
) {
    val botState by engine.state.collectAsState()
    val scope = rememberCoroutineScope()
    
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            // Bot Control Panel
            GlassCard(
                glowColor = when (botState) {
                    is BotState.Running -> CocNeonGreen
                    is BotState.Stopped -> CocNeonPink
                    else -> CocNeonYellow
                }
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "CoC AutoX Bot",
                            style = MaterialTheme.typography.headlineMedium.copy(
                                color = CocNeonCyan,
                                fontWeight = FontWeight.Bold
                            )
                        )
                        StatusIndicator(
                            status = botState::class.simpleName ?: "UNKNOWN",
                            isActive = botState is BotState.Running,
                            activeColor = CocNeonGreen,
                            inactiveColor = CocNeonYellow
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        GlassButton(
                            text = "Launch",
                            onClick = onLaunchBot,
                            icon = Icons.Default.PlayArrow,
                            glowColor = CocNeonGreen,
                            modifier = Modifier.weight(1f)
                        )
                        
                        GlassButton(
                            text = "Stop",
                            onClick = { 
                                scope.launch { 
                                    engine.stop()
                                    dataStore.setBotState("STOPPED")
                                    dataStore.setBotEnabled(false)
                                }
                            },
                            icon = Icons.Default.Stop,
                            glowColor = CocNeonPink,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }
        
        item {
            // Coordinate Picker
            GlassCard(glowColor = CocNeonCyan) {
                Column {
                    Text(
                        text = "Screen Coordinates",
                        style = MaterialTheme.typography.titleMedium.copy(
                            color = CocNeonCyan,
                            fontWeight = FontWeight.Bold
                        )
                    )
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    GlassButton(
                        text = "Pick Target Coordinates",
                        onClick = onNavigateToPicker,
                        icon = Icons.Default.TouchApp,
                        glowColor = CocNeonCyan,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }
        
        item {
            // Quick Stats
            GlassCard(glowColor = CocNeonYellow) {
                Column {
                    Text(
                        text = "Bot Statistics",
                        style = MaterialTheme.typography.titleMedium.copy(
                            color = CocNeonYellow,
                            fontWeight = FontWeight.Bold
                        )
                    )
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(
                                text = "Runtime",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = CocTextSecondary,
                                    fontFamily = JetBrainsMono
                                )
                            )
                            Text(
                                text = "00:00:00",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    color = CocTextPrimary,
                                    fontFamily = JetBrainsMono
                                )
                            )
                        }
                        
                        Column {
                            Text(
                                text = "Actions",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = CocTextSecondary,
                                    fontFamily = JetBrainsMono
                                )
                            )
                            Text(
                                text = "0",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    color = CocTextPrimary,
                                    fontFamily = JetBrainsMono
                                )
                            )
                        }
                        
                        Column {
                            Text(
                                text = "Success Rate",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = CocTextSecondary,
                                    fontFamily = JetBrainsMono
                                )
                            )
                            Text(
                                text = "100%",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    color = CocNeonGreen,
                                    fontFamily = JetBrainsMono
                                )
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun LogsScreen() {
    val logs by bot.jarvis.coc.core.LogManager.logs.collectAsState()
    
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(logs) { log ->
            GlassCard(
                glowColor = when(log.level) {
                    bot.jarvis.coc.core.LogLevel.ERROR -> CocNeonPink
                    bot.jarvis.coc.core.LogLevel.WARN -> CocNeonYellow
                    else -> CocNeonCyan
                }
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = log.formattedTime,
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = CocTextSecondary,
                                fontFamily = JetBrainsMono
                            )
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "[${log.level}]",
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = when(log.level) {
                                    bot.jarvis.coc.core.LogLevel.ERROR -> CocNeonPink
                                    bot.jarvis.coc.core.LogLevel.WARN -> CocNeonYellow
                                    else -> CocNeonCyan
                                },
                                fontFamily = JetBrainsMono
                            )
                        )
                    }
                    Text(
                        text = log.message,
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = CocTextPrimary,
                            fontFamily = JetBrainsMono
                        )
                    )
                }
            }
        }
    }
}

@Composable
fun SettingsScreen(dataStore: AppDataStore) {
    val scope = rememberCoroutineScope()
    
    val collectResources by dataStore.collectResources.collectAsState(initial = true)
    val trainTroops by dataStore.trainTroops.collectAsState(initial = true)
    val donateTroops by dataStore.donateTroops.collectAsState(initial = false)
    val clanChatEnabled by dataStore.clanChatEnabled.collectAsState(initial = false)

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            GlassCard(glowColor = CocNeonCyan) {
                Column {
                    Text(
                        text = "Bot Configuration",
                        style = MaterialTheme.typography.titleMedium.copy(
                            color = CocNeonCyan,
                            fontWeight = FontWeight.Bold
                        )
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Resource Collection
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Collect Resources",
                                style = MaterialTheme.typography.titleSmall.copy(
                                    color = CocTextPrimary,
                                    fontFamily = JetBrainsMono
                                )
                            )
                            Text(
                                text = "Auto-collect gold, elixir, etc.",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = CocTextSecondary,
                                    fontFamily = JetBrainsMono
                                )
                            )
                        }
                        Switch(
                            checked = collectResources,
                            onCheckedChange = { 
                                scope.launch { 
                                    dataStore.setBotSettings(
                                        collectResources = it,
                                        trainTroops = trainTroops,
                                        donateTroops = donateTroops,
                                        clanChatEnabled = clanChatEnabled
                                    )
                                }
                            },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = CocNeonGreen,
                                uncheckedThumbColor = CocTextSecondary
                            )
                        )
                    }
                    
                    Divider(
                        color = CocNeonCyan.copy(alpha = 0.3f),
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                    
                    // Troop Training
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Train Troops",
                                style = MaterialTheme.typography.titleSmall.copy(
                                    color = CocTextPrimary,
                                    fontFamily = JetBrainsMono
                                )
                            )
                            Text(
                                text = "Auto-train troops in barracks",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = CocTextSecondary,
                                    fontFamily = JetBrainsMono
                                )
                            )
                        }
                        Switch(
                            checked = trainTroops,
                            onCheckedChange = { 
                                scope.launch { 
                                    dataStore.setBotSettings(
                                        collectResources = collectResources,
                                        trainTroops = it,
                                        donateTroops = donateTroops,
                                        clanChatEnabled = clanChatEnabled
                                    )
                                }
                            },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = CocNeonGreen,
                                uncheckedThumbColor = CocTextSecondary
                            )
                        )
                    }
                    
                    Divider(
                        color = CocNeonCyan.copy(alpha = 0.3f),
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                    
                    // Troop Donation
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Donate Troops",
                                style = MaterialTheme.typography.titleSmall.copy(
                                    color = CocTextPrimary,
                                    fontFamily = JetBrainsMono
                                )
                            )
                            Text(
                                text = "Auto-donate to clan mates",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = CocTextSecondary,
                                    fontFamily = JetBrainsMono
                                )
                            )
                        }
                        Switch(
                            checked = donateTroops,
                            onCheckedChange = { 
                                scope.launch { 
                                    dataStore.setBotSettings(
                                        collectResources = collectResources,
                                        trainTroops = trainTroops,
                                        donateTroops = it,
                                        clanChatEnabled = clanChatEnabled
                                    )
                                }
                            },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = CocNeonGreen,
                                uncheckedThumbColor = CocTextSecondary
                            )
                        )
                    }
                    
                    Divider(
                        color = CocNeonCyan.copy(alpha = 0.3f),
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                    
                    // Clan Chat
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Clan Chat",
                                style = MaterialTheme.typography.titleSmall.copy(
                                    color = CocTextPrimary,
                                    fontFamily = JetBrainsMono
                                )
                            )
                            Text(
                                text = "Monitor clan chat messages",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = CocTextSecondary,
                                    fontFamily = JetBrainsMono
                                )
                            )
                        }
                        Switch(
                            checked = clanChatEnabled,
                            onCheckedChange = { 
                                scope.launch { 
                                    dataStore.setBotSettings(
                                        collectResources = collectResources,
                                        trainTroops = trainTroops,
                                        donateTroops = donateTroops,
                                        clanChatEnabled = it
                                    )
                                }
                            },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = CocNeonGreen,
                                uncheckedThumbColor = CocTextSecondary
                            )
                        )
                    }
                }
            }
        }
    }
}