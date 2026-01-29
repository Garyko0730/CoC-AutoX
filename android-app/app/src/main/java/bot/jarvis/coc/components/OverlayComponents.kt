package bot.jarvis.coc.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import bot.jarvis.coc.theme.*

@Composable
fun OverlayCompactIcon(
    isExpanded: Boolean,
    onToggle: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .size(56.dp)
            .background(
                color = CocGlassDark,
                shape = RoundedCornerShape(28.dp)
            )
            .neonGlow(glowColor = CocNeonCyan),
        contentAlignment = Alignment.Center
    ) {
        NeonIcon(
            icon = if (isExpanded) Icons.Default.Close else Icons.Default.PlayArrow,
            contentDescription = if (isExpanded) "Collapse" else "Expand",
            glowColor = CocNeonCyan,
            size = 32.dp
        )
    }
}

@Composable
fun OverlayExpandedPanel(
    botState: String,
    isBotActive: Boolean,
    onStart: () -> Unit,
    onPause: () -> Unit,
    onStop: () -> Unit,
    onSettings: () -> Unit,
    onExit: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .width(280.dp)
            .height(400.dp)
            .glassmorphism(
                backgroundColor = CocGlass,
                borderColor = CocNeonCyan,
                cornerRadius = 20
            )
            .neonGlow(glowColor = CocNeonCyan),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.Transparent
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "CoC AutoX",
                    style = MaterialTheme.typography.titleMedium.copy(
                        color = CocNeonCyan,
                        fontWeight = FontWeight.Bold
                    )
                )
                StatusIndicator(
                    status = botState,
                    isActive = isBotActive,
                    activeColor = CocNeonGreen,
                    inactiveColor = CocNeonYellow
                )
            }
            
            Divider(
                color = CocNeonCyan.copy(alpha = 0.3f),
                thickness = 1.dp
            )
            
            // Control Buttons
            Column(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                GlassButton(
                    text = "Start",
                    onClick = onStart,
                    icon = Icons.Default.PlayArrow,
                    glowColor = CocNeonGreen,
                    modifier = Modifier.fillMaxWidth()
                )
                
                GlassButton(
                    text = "Pause",
                    onClick = onPause,
                    icon = Icons.Default.Pause,
                    glowColor = CocNeonYellow,
                    modifier = Modifier.fillMaxWidth()
                )
                
                GlassButton(
                    text = "Stop",
                    onClick = onStop,
                    icon = Icons.Default.Stop,
                    glowColor = CocNeonPink,
                    modifier = Modifier.fillMaxWidth()
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Bottom Actions
            Column(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                GlassButton(
                    text = "Settings",
                    onClick = onSettings,
                    icon = Icons.Default.Settings,
                    glowColor = CocNeonCyan,
                    modifier = Modifier.fillMaxWidth()
                )
                
                GlassButton(
                    text = "Exit",
                    onClick = onExit,
                    icon = Icons.Default.ExitToApp,
                    glowColor = CocNeonPink,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}