package bot.jarvis.coc.core

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import java.io.File

interface ScreenCapturer {
    fun capture(): Bitmap?
}

class RootScreenCapturer : ScreenCapturer {
    override fun capture(): Bitmap? {
        val path = "/data/local/tmp/coc_screenshot.png"
        // 1. Execute screencap
        if (ShellExecutor.captureScreen(path)) {
            // 2. Read file (Note: App needs permission to read this path or copy it out)
            // Ideally we cat the file or move it to app cache. 
            // For simplicity in Root, usually we can read /sdcard/ or app specific cache if we write there.
            // But shell writes as root. We need to make it readable or copy it.
            
            // Simpler Root approach: 'screencap -p' and read stdout? 
            // ShellExecutor currently only returns Boolean.
            
            // Fallback for now: assume we can read it if we adjust permissions
            ShellExecutor.exec("chmod 666 $path")
            return BitmapFactory.decodeFile(path)
        }
        return null
    }
}

object ScreenCaptureManager {
    private var mediaProjectionCapturer: ScreenCapturer? = null
    private val rootCapturer = RootScreenCapturer()
    
    fun capture(): Bitmap? {
        // Prefer MediaProjection (High FPS)
        mediaProjectionCapturer?.let { return it.capture() }
        
        // Fallback to Root
        if (ShellExecutor.isRootAvailable()) {
            return rootCapturer.capture()
        }
        
        return null
    }
    
    fun setMediaProjectionCapturer(capturer: ScreenCapturer) {
        mediaProjectionCapturer = capturer
    }
}
