package bot.jarvis.coc.screens

import android.app.Activity
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Bundle
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import bot.jarvis.coc.components.GlassButton
import bot.jarvis.coc.components.NeonIcon
import bot.jarvis.coc.data.AppDataStore
import bot.jarvis.coc.theme.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class CoordinatePickerActivity : ComponentActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Make the activity transparent and fullscreen
        window.apply {
            addFlags(WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL)
            addFlags(WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE)
            addFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS)
            addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN)
            addFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS)
            addFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION)
            statusBarColor = android.graphics.Color.TRANSPARENT
            navigationBarColor = android.graphics.Color.TRANSPARENT
            setBackgroundDrawableResource(android.R.color.transparent)
        }
        
        setContent {
            CoCAutoXTheme {
                CoordinatePickerScreen(
                    onCoordinatesSelected = { xRatio, yRatio ->
                        saveCoordinatesAndFinish(xRatio, yRatio)
                    },
                    onCancel = {
                        finish()
                    }
                )
            }
        }
    }
    
    private fun saveCoordinatesAndFinish(xRatio: Float, yRatio: Float) {
        val dataStore = AppDataStore(this)
        CoroutineScope(Dispatchers.Main).launch {
            dataStore.setTargetCoordinates(xRatio, yRatio)
            finish()
        }
    }
}

@Composable
fun CoordinatePickerScreen(
    onCoordinatesSelected: (Float, Float) -> Unit,
    onCancel: () -> Unit
) {
    var touchPosition by remember { mutableStateOf(Offset.Zero) }
    var isTouching by remember { mutableStateOf(false) }
    val context = LocalContext.current
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Transparent)
    ) {
        // Touch capture canvas
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .pointerInput(Unit) {
                    awaitPointerEventScope {
                        while (true) {
                            val event = awaitPointerEvent()
                            when (event.type) {
                                MotionEvent.ACTION_DOWN, MotionEvent.ACTION_MOVE -> {
                                    val pointer = event.changes.first()
                                    touchPosition = pointer.position
                                    isTouching = true
                                    pointer.consume()
                                }
                                MotionEvent.ACTION_UP -> {
                                    isTouching = false
                                    val screenWidth = context.resources.displayMetrics.widthPixels.toFloat()
                                    val screenHeight = context.resources.displayMetrics.heightPixels.toFloat()
                                    val xRatio = touchPosition.x / screenWidth
                                    val yRatio = touchPosition.y / screenHeight
                                    onCoordinatesSelected(xRatio, yRatio)
                                }
                            }
                        }
                    }
                }
        ) {
            if (isTouching) {
                // Draw crosshair at touch position
                val crosshairColor = CocNeonCyan
                val crosshairSize = 40.dp.toPx()
                
                // Horizontal line
                drawLine(
                    color = crosshairColor,
                    start = Offset(touchPosition.x - crosshairSize, touchPosition.y),
                    end = Offset(touchPosition.x + crosshairSize, touchPosition.y),
                    strokeWidth = 2.dp.toPx()
                )
                
                // Vertical line
                drawLine(
                    color = crosshairColor,
                    start = Offset(touchPosition.x, touchPosition.y - crosshairSize),
                    end = Offset(touchPosition.x, touchPosition.y + crosshairSize),
                    strokeWidth = 2.dp.toPx()
                )
                
                // Circle
                drawCircle(
                    color = crosshairColor,
                    radius = 15.dp.toPx(),
                    center = touchPosition,
                    style = Stroke(width = 2.dp.toPx())
                )
                
                // Center dot
                drawCircle(
                    color = crosshairColor,
                    radius = 4.dp.toPx(),
                    center = touchPosition
                )
            }
        }
        
        // Instructions panel
        Card(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(16.dp)
                .glassmorphism(
                    backgroundColor = CocGlass,
                    borderColor = CocNeonCyan,
                    cornerRadius = 16
                )
                .neonGlow(glowColor = CocNeonCyan),
            colors = CardDefaults.cardColors(containerColor = Color.Transparent)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Touch to Select Coordinate",
                    style = MaterialTheme.typography.titleMedium.copy(
                        color = CocNeonCyan
                    )
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = if (isTouching) {
                        val screenWidth = context.resources.displayMetrics.widthPixels.toFloat()
                        val screenHeight = context.resources.displayMetrics.heightPixels.toFloat()
                        val xRatio = touchPosition.x / screenWidth
                        val yRatio = touchPosition.y / screenHeight
                        "X: ${String.format("%.3f", xRatio)}, Y: ${String.format("%.3f", yRatio)}"
                    } else {
                        "Tap anywhere on screen"
                    },
                    style = MaterialTheme.typography.bodyMedium.copy(
                        color = CocTextSecondary,
                        fontFamily = JetBrainsMono
                    )
                )
                
                Spacer(modifier = Modifier.height(12.dp))
                
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    if (isTouching) {
                        GlassButton(
                            text = "Confirm",
                            onClick = {
                                val screenWidth = context.resources.displayMetrics.widthPixels.toFloat()
                                val screenHeight = context.resources.displayMetrics.heightPixels.toFloat()
                                val xRatio = touchPosition.x / screenWidth
                                val yRatio = touchPosition.y / screenHeight
                                onCoordinatesSelected(xRatio, yRatio)
                            },
                            icon = Icons.Default.Check,
                            glowColor = CocNeonGreen
                        )
                    }
                    
                    GlassButton(
                        text = "Cancel",
                        onClick = onCancel,
                        icon = Icons.Default.Close,
                        glowColor = CocNeonPink
                    )
                }
            }
        }
        
        // Coordinate display (if touching)
        if (isTouching) {
            Card(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(16.dp)
                    .glassmorphism(
                        backgroundColor = CocGlass,
                        borderColor = CocNeonCyan,
                        cornerRadius = 12
                    )
                    .neonGlow(glowColor = CocNeonCyan),
                colors = CardDefaults.cardColors(containerColor = Color.Transparent)
            ) {
                Column(
                    modifier = Modifier.padding(12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    val screenWidth = context.resources.displayMetrics.widthPixels.toFloat()
                    val screenHeight = context.resources.displayMetrics.heightPixels.toFloat()
                    val xRatio = touchPosition.x / screenWidth
                    val yRatio = touchPosition.y / screenHeight
                    
                    Text(
                        text = "Selected Coordinate",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = CocTextSecondary,
                            fontFamily = JetBrainsMono
                        )
                    )
                    
                    Text(
                        text = "X: ${String.format("%.3f", xRatio)} | Y: ${String.format("%.3f", yRatio)}",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = CocNeonCyan,
                            fontFamily = JetBrainsMono
                        )
                    )
                }
            }
        }
    }
}