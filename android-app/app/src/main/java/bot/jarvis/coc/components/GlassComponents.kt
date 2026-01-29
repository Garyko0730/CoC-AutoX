package bot.jarvis.coc.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import bot.jarvis.coc.theme.*

@Composable
fun GlassButton(
    text: String,
    onClick: () -> Unit,
    icon: ImageVector? = null,
    modifier: Modifier = Modifier,
    glowColor: Color = CocNeonCyan,
    enabled: Boolean = true
) {
    Box(
        modifier = modifier
            .glassmorphism(
                backgroundColor = if (enabled) CocGlass else CocGlass.copy(alpha = 0.3f),
                borderColor = glowColor,
                cornerRadius = 12
            )
            .neonGlow(glowColor = glowColor)
            .clickable(enabled) { onClick() }
            .padding(horizontal = 20.dp, vertical = 12.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            icon?.let {
                Icon(
                    imageVector = it,
                    contentDescription = null,
                    tint = glowColor,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
            }
            Text(
                text = text,
                style = MaterialTheme.typography.labelLarge.copy(
                    color = if (enabled) glowColor else glowColor.copy(alpha = 0.5f),
                    fontWeight = FontWeight.Bold
                )
            )
        }
    }
}

@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    glowColor: Color = CocNeonCyan,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = modifier
            .glassmorphism(
                backgroundColor = CocGlass,
                borderColor = glowColor,
                cornerRadius = 16
            )
            .neonGlow(glowColor = glowColor),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.Transparent
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            content = content
        )
    }
}

@Composable
fun StatusIndicator(
    status: String,
    isActive: Boolean,
    modifier: Modifier = Modifier,
    activeColor: Color = CocNeonGreen,
    inactiveColor: Color = CocNeonYellow
) {
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(12.dp)
                .background(
                    color = if (isActive) activeColor else inactiveColor,
                    shape = RoundedCornerShape(6.dp)
                )
                .neonGlow(glowColor = if (isActive) activeColor else inactiveColor)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = status,
            style = MaterialTheme.typography.labelMedium.copy(
                color = if (isActive) activeColor else inactiveColor,
                fontFamily = JetBrainsMono
            )
        )
    }
}

@Composable
fun NeonIcon(
    icon: ImageVector,
    contentDescription: String? = null,
    modifier: Modifier = Modifier,
    glowColor: Color = CocNeonCyan,
    size: androidx.compose.ui.unit.Dp = 24.dp
) {
    Icon(
        imageVector = icon,
        contentDescription = contentDescription,
        tint = glowColor,
        modifier = modifier
            .size(size)
            .neonGlow(glowColor = glowColor)
    )
}