package com.arflix.tv.ui.screens.tv.live

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.focusable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.key.*
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.arflix.tv.data.model.IptvChannel

@Composable
internal fun VodCatalogPane(
    title: String,
    channels: List<EnrichedChannel>,
    loading: Boolean,
    onPlay: (IptvChannel) -> Unit,
    onOpenCategories: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val isRtl = LocalLayoutDirection.current == LayoutDirection.Rtl
    val gridState = rememberLazyGridState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(LiveColors.Bg)
            .padding(horizontal = 24.dp, vertical = 16.dp)
    ) {
        // Header Row: Title & Total Count
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Movie,
                    contentDescription = null,
                    tint = liveAccent(),
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = title,
                    style = LiveType.CatLabel.copy(
                        color = LiveColors.Fg,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
            }
            if (channels.isNotEmpty()) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(LiveColors.PanelDeep)
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "${channels.size} כותרים",
                        style = LiveType.Badge.copy(color = LiveColors.FgDim, fontSize = 12.sp)
                    )
                }
            }
        }

        // Body: Loading, Empty, or Grid
        if (loading && channels.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(color = liveAccent(), modifier = Modifier.size(48.dp))
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "טוען תוכן VOD...",
                        style = LiveType.ProgramTitle.copy(color = LiveColors.FgDim, fontSize = 14.sp)
                    )
                }
            }
        } else if (channels.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "אין כותרים בקטגוריה זו",
                    style = LiveType.ProgramTitle.copy(color = LiveColors.FgDim, fontSize = 15.sp)
                )
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Adaptive(minSize = 140.dp),
                state = gridState,
                contentPadding = PaddingValues(bottom = 32.dp),
                horizontalArrangement = Arrangement.spacedBy(14.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                itemsIndexed(
                    channels,
                    key = { _, ch -> ch.id }
                ) { index, ch ->
                    VodPosterCard(
                        channel = ch.source,
                        isRtl = isRtl,
                        columnIndex = index % 5,
                        onClick = { onPlay(ch.source) },
                        onBackToSidebar = onOpenCategories,
                    )
                }
            }
        }
    }
}

@Composable
private fun VodPosterCard(
    channel: IptvChannel,
    isRtl: Boolean,
    columnIndex: Int,
    onClick: () -> Unit,
    onBackToSidebar: () -> Unit,
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isFocused by interactionSource.collectIsFocusedAsState()
    val scale by animateFloatAsState(if (isFocused) 1.05f else 1.0f, label = "vod_scale")

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(0.67f) // 2:3 movie poster ratio
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .clip(RoundedCornerShape(8.dp))
            .background(LiveColors.PanelDeep)
            .border(
                border = if (isFocused) BorderStroke(2.dp, LiveColors.FocusRing) else BorderStroke(1.dp, LiveColors.Divider),
                shape = RoundedCornerShape(8.dp)
            )
            .clickable(interactionSource = interactionSource, indication = null, onClick = onClick)
            .focusable(interactionSource = interactionSource)
            .onKeyEvent { keyEvent ->
                if (keyEvent.type != KeyEventType.KeyDown) return@onKeyEvent false
                if (keyEvent.key == Key.Back || keyEvent.key == Key.Escape) {
                    onBackToSidebar()
                    return@onKeyEvent true
                }
                val isEdge = columnIndex == 0
                if (isRtl && keyEvent.key == Key.DirectionRight && isEdge) {
                    onBackToSidebar()
                    return@onKeyEvent true
                } else if (!isRtl && keyEvent.key == Key.DirectionLeft && isEdge) {
                    onBackToSidebar()
                    return@onKeyEvent true
                }
                false
            }
    ) {
        // Poster Image
        if (!channel.logo.isNullOrBlank()) {
            AsyncImage(
                model = channel.logo,
                contentDescription = channel.name,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
        } else {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(LiveColors.PanelDeep),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Movie,
                    contentDescription = null,
                    tint = LiveColors.FgDim,
                    modifier = Modifier.size(36.dp)
                )
            }
        }

        // Bottom gradient overlay with title
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.5f)
                .align(Alignment.BottomCenter)
                .background(
                    Brush.verticalGradient(
                        colors = listOf(Color.Transparent, Color(0xEE000000))
                    )
                )
                .padding(horizontal = 8.dp, vertical = 6.dp),
            contentAlignment = Alignment.BottomStart
        ) {
            Text(
                text = channel.name,
                style = LiveType.ProgramTitle.copy(
                    color = if (isFocused) LiveColors.FocusRing else Color.White,
                    fontSize = 11.sp,
                    fontWeight = if (isFocused) FontWeight.Bold else FontWeight.Medium
                ),
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}
