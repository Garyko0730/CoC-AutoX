package bot.jarvis.coc.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val CocColorScheme = lightColorScheme(
    primary = CocPrimary,
    secondary = CocSecondary,
    background = CocBackground,
    surface = CocSurface,
    onPrimary = CocTextPrimary,
    onSecondary = CocTextPrimary,
    onBackground = CocTextPrimary,
    onSurface = CocTextPrimary,
    primaryContainer = CocPrimary.copy(alpha = 0.2f),
    secondaryContainer = CocSecondary.copy(alpha = 0.2f),
    surfaceContainer = CocSurface.copy(alpha = 0.5f)
)

@Composable
fun CoCAutoXTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = CocColorScheme,
        typography = CocTypography,
        content = content
    )
}