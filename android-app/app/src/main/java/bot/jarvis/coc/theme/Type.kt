package bot.jarvis.coc.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import bot.jarvis.coc.R

val RobotoBold = FontFamily(
    Font(R.font.roboto_bold, FontWeight.Bold)
)

val JetBrainsMono = FontFamily(
    Font(R.font.jetbrains_mono_regular, FontWeight.Normal),
    Font(R.font.jetbrains_mono_bold, FontWeight.Bold)
)

val CocTypography = Typography(
    displayLarge = androidx.compose.material3.Typography().displayLarge.copy(
        fontFamily = RobotoBold,
        fontWeight = FontWeight.Bold
    ),
    displayMedium = androidx.compose.material3.Typography().displayMedium.copy(
        fontFamily = RobotoBold,
        fontWeight = FontWeight.Bold
    ),
    headlineLarge = androidx.compose.material3.Typography().headlineLarge.copy(
        fontFamily = RobotoBold,
        fontWeight = FontWeight.Bold
    ),
    headlineMedium = androidx.compose.material3.Typography().headlineMedium.copy(
        fontFamily = RobotoBold,
        fontWeight = FontWeight.Bold
    ),
    titleLarge = androidx.compose.material3.Typography().titleLarge.copy(
        fontFamily = RobotoBold,
        fontWeight = FontWeight.Bold
    ),
    titleMedium = androidx.compose.material3.Typography().titleMedium.copy(
        fontFamily = RobotoBold,
        fontWeight = FontWeight.Bold
    ),
    bodyLarge = androidx.compose.material3.Typography().bodyLarge.copy(
        fontFamily = JetBrainsMono,
        fontWeight = FontWeight.Normal
    ),
    bodyMedium = androidx.compose.material3.Typography().bodyMedium.copy(
        fontFamily = JetBrainsMono,
        fontWeight = FontWeight.Normal
    ),
    labelLarge = androidx.compose.material3.Typography().labelLarge.copy(
        fontFamily = JetBrainsMono,
        fontWeight = FontWeight.Medium
    ),
    labelMedium = androidx.compose.material3.Typography().labelMedium.copy(
        fontFamily = JetBrainsMono,
        fontWeight = FontWeight.Medium
    ),
    labelSmall = androidx.compose.material3.Typography().labelSmall.copy(
        fontFamily = JetBrainsMono,
        fontWeight = FontWeight.Normal
    )
)