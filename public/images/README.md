# Images Folder

This folder is for storing images used in email templates.

## Usage

- Images uploaded through the template builder will be stored here
- You can reference images in templates using: `/images/your-image-name.jpg`
- The public folder is served statically by Vite, so images are accessible at the root path

## Example

If you upload an image named `product-hero.jpg`, you can use it in templates as:
```
https://yourdomain.com/images/product-hero.jpg
```

Or in the template builder, you can use:
```
/images/product-hero.jpg
```
