package bot.jarvis.coc.screens

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import bot.jarvis.coc.data.AppDataStore
import bot.jarvis.coc.theme.*
import kotlinx.coroutines.launch

class SettingsActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            CoCAutoXTheme {
                SettingsScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val dataStore = remember { AppDataStore(context) }
    val scope = rememberCoroutineScope()
    
    var botEnabled by remember { mutableStateOf(false) }
    var overlayExpanded by remember { mutableStateOf(false) }
    var debugMode by remember { mutableStateOf(false) }
    
    // Load current settings
    LaunchedEffect(Unit) {
        dataStore.botEnabled.collect { enabled ->
            botEnabled = enabled
        }
        dataStore.overlayExpanded.collect { expanded ->
            overlayExpanded = expanded
        }
        dataStore.debugMode.collect { debug ->
            debugMode = debug
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings") },
                navigationIcon = {
                    IconButton(onClick = { 
                        (context as? ComponentActivity)?.finish()
                    }) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = CocBackground,
                    titleContentColor = CocNeonCyan,
                    navigationIconContentColor = CocNeonCyan
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // Bot Settings
            SettingsSection(title = "Bot Settings") {
                SwitchSetting(
                    title = "Enable Bot",
                    description = "Allow bot to run automation",
                    value = botEnabled,
                    onValueChanged = { enabled ->
                        botEnabled = enabled
                        scope.launch { dataStore.setBotEnabled(enabled) }
                    }
                )
                
                SwitchSetting(
                    title = "Debug Mode",
                    description = "Enable detailed logging",
                    value = debugMode,
                    onValueChanged = { debug ->
                        debugMode = debug
                        scope.launch { dataStore.setDebugMode(debug) }
                    }
                )
            }
            
            // Overlay Settings
            SettingsSection(title = "Overlay Settings") {
                SwitchSetting(
                    title = "Auto-expand Overlay",
                    description = "Automatically expand overlay on start",
                    value = overlayExpanded,
                    onValueChanged = { expanded ->
                        overlayExpanded = expanded
                        scope.launch { dataStore.setOverlayExpanded(expanded) }
                    }
                )
            }
            
            // Actions
            SettingsSection(title = "Actions") {
                ActionButton(
                    title = "Coordinate Picker",
                    description = "Open coordinate calibration tool",
                    onClick = {
                        val intent = Intent(context, CoordinatePickerActivity::class.java)
                        context.startActivity(intent)
                    }
                )
                
                ActionButton(
                    title = "Reset Settings",
                    description = "Reset all settings to default",
                    onClick = {
                        scope.launch {
                            dataStore.setBotEnabled(false)
                            dataStore.setOverlayExpanded(false)
                            dataStore.setDebugMode(false)
                            dataStore.setBotState("STOPPED")
                        }
                    }
                )
            }
        }
    }
}

@Composable
fun SettingsSection(
    title: String,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = CocGlassDark
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 4.dp
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium.copy(
                    color = CocNeonCyan,
                    fontWeight = FontWeight.Bold
                ),
                modifier = Modifier.padding(bottom = 12.dp)
            )
            content()
        }
    }
}

@Composable
fun SwitchSetting(
    title: String,
    description: String,
    value: Boolean,
    onValueChanged: (Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge.copy(
                    color = CocTextPrimary
                )
            )
            Text(
                text = description,
                style = MaterialTheme.typography.bodySmall.copy(
                    color = CocTextSecondary
                )
            )
        }
        
        Switch(
            checked = value,
            onCheckedChange = onValueChanged,
            colors = SwitchDefaults.colors(
                checkedThumbColor = CocNeonCyan,
                checkedTrackColor = CocNeonCyan.copy(alpha = 0.3f),
                uncheckedThumbColor = CocTextSecondary,
                uncheckedTrackColor = CocGlass
            )
        )
    }
}

@Composable
fun ActionButton(
    title: String,
    description: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        colors = ButtonDefaults.outlinedButtonColors(
            contentColor = CocNeonCyan
        ),
        border = androidx.compose.foundation.BorderStroke(
            1.dp, CocNeonCyan.copy(alpha = 0.5f)
        )
    ) {
        Column(
            horizontalAlignment = Alignment.Start,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge.copy(
                    color = CocNeonCyan
                )
            )
            Text(
                text = description,
                style = MaterialTheme.typography.bodySmall.copy(
                    color = CocTextSecondary
                )
            )
        }
    }
}