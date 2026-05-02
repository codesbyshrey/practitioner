from reactpy import component, html, run

@component
def Title(title):
    return html.h1(title)

# Load an image from https://picsum.photos/id/152/500/300,
# specify style of the image using CSS: width: 30%
@component
def Photo():
    return html.img(
        {
            "src": "https://picsum.photos/id/152/500/300",
            "style": {"width": "30%"},
        }
    )

@component
def PhotographerName(caption):
    return html.h4(caption)

# Combine all previous components in one function
@component
def PhotoViewer():
    return html.section(
        Title("Photo of the day"),
        Photo(),
        PhotographerName("Steven Spassov")
    )

run(PhotoViewer)