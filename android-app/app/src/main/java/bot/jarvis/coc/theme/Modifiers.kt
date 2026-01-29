package bot.jarvis.coc.theme

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

fun Modifier.glassmorphism(
    backgroundColor: Color = CocGlass,
    borderColor: Color = CocNeonCyan,
    cornerRadius: Int = 16
) = this
    .background(
        brush = Brush.radialGradient(
            colors = listOf(
                backgroundColor,
                backgroundColor.copy(alpha = 0.5f)
            )
        ),
        shape = RoundedCornerShape(cornerRadius.dp)
    )
    .border(
        width = 1.dp,
        brush = Brush.linearGradient(
            colors = listOf(
                borderColor.copy(alpha = 0.8f),
                borderColor.copy(alpha = 0.2f)
            )
        ),
        shape = RoundedCornerShape(cornerRadius.dp)
    )
    .shadow(
        elevation = 8.dp,
        shape = RoundedCornerShape(cornerRadius.dp),
        ambientColor = borderColor.copy(alpha = 0.3f),
        spotColor = borderColor.copy(alpha = 0.3f)
    )

fun Modifier.neonGlow(
    glowColor: Color = CocNeonCyan,
    glowRadius: Float = 20f
) = this
    .shadow(
        elevation = glowRadius.dp,
        shape = RoundedCornerShape(8.dp),
        ambientColor = glowColor,
        spotColor = glowColor
    )