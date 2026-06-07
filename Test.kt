
import androidx.compose.ui.input.key.Key

fun test(key: Key, isRtl: Boolean) {
    when (key) {
        (if (isRtl) Key.DirectionRight else Key.DirectionLeft) -> println(1)
        (if (isRtl) Key.DirectionLeft else Key.DirectionRight) -> println(2)
        else -> println(3)
    }
}
