
import tkinter
from tkinter import messagebox, Button, Canvas
top = tkinter.Tk()
top.title('Tkinter Test GUI')
top.geometry("600x600")

# Changes background of all buttons refering to 'top'.
# top.option_add("*Button.Background", "black")
# top.option_add("*Button.Foreground", "red")

canvas = tkinter.Canvas(top, bg="blue", height=300, width=300)
canvas.grid(row=8,column=0)
   

def popupmessage_called():
   messagebox.showinfo( "Hello Python", "Hello World")

def but1_pressed(): # Will create a new button during runtime.
   but3 = tkinter.Button(top, text="Created button - Press for canvas shape", bg="red", height=5 , width=10, wraplength=60, command=realtimebut_called).grid(row=0,column=3)

def but2_pressed():   
   but1.configure(bg="blue")

def realtimebut_called():
   coord = 50, 50, 250, 250 # x1, y1, x2, y2 shape coordinates within canvas area.
   arc = canvas.create_arc(coord, start=0, extent=250, fill="red")
 
   
# Display popup message box.
popupbut = tkinter.Button(top, text="Pop Up Message", command=popupmessage_called, activebackground="magenta", bd=5, bg="cyan", height=4 , width=10, wraplength=60) 
popupbut.grid(row=0,column=0)

# Create new button during runtime.
but1 = tkinter.Button(top, text="Create another button", command=but1_pressed, height=5 , width=10, wraplength=60, bg="green") 
but1.grid(row=0,column=1)

# Change background color of green button.
but2 = tkinter.Button(top, text="Change green button to blue", command=but2_pressed, height=5, width=10, wraplength=60 ) 
but2.grid(row=0,column=2)

top.mainloop()

