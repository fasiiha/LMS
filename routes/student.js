const express = require("express");
const router = express.Router();
const Student = require("../models/student");
const Class = require("../models/class");
const Course = require("../models/courses");
const { withdrawCourse, enrollCourse } = require("../Controllers/student");

// GET Routes
router.get("/", function (req, res, next) {
  res.send("Student Dashboard");
});

// Route to get teachers for a student
router.get("/teachers/:sid", async (req, res) => {
  try {
    const studentId = req.params.sid;

    // Find all classes that the student is enrolled in
    const classes = await Class.find({ "students.sid": studentId }).populate(
      "teachers.tid"
    );

    // Extract the unique teachers from the classes
    const teachers = [];
    const teacherIds = new Set();

    classes.forEach((classItem) => {
      classItem.teachers.forEach((teacher) => {
        if (!teacherIds.has(teacher.tid._id.toString())) {
          teacherIds.add(teacher.tid._id.toString());
          teachers.push(teacher.tid);
        }
      });
    });

    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get all teachers that are teaching to a student.
router.get('/getteachers/:sid', function(req,res,next) {

  const { sid } = req.params;

  Class.find({'students.sid':sid} , {teacher:1}).populate('teachers.tid')
  .exec()
  .then((result) => {
      if(result.length == 0){
        res.statusCode=404;
        res.json({message:"Teacher not found"});
      }
      else{
          res.statusCode=200;
          res.json(result);
      }
  }, (err) => {return (err)})
})


// Route to get grades for a student
router.get("/grades/:sid", async (req, res) => {
  const { sid } = req.params;

  try {
    const courses = await Course.find(
      { "students.sid": sid },
      "name students.$"
    );

    const grades = courses.map((course) => {
      const studentData = course.students.find(
        (student) => student.sid.toString() === sid
      );
      return {
        courseName: course.name,
        marks: studentData.marks,
      };
    });

    res.json({ grades });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Route to withdraw from a course
router.delete("/withdrawcourse/:cid", async (req, res) => {
  withdrawCourse(req, res);
});

// Route to enroll in a course
router.post("/enrollcourse/:cid", async (req, res) => {
  enrollCourse(req, res);
});

//Get student enrolled in particular course
router.get('/getStudentEnrolled', function(req, res, next){
    const courseId = req.body.courseId;
    Course.findById(courseId).populate('students.sid')
        .then((course)=>{
            if(!course){
                res.statusCode=404;
                res.json({message:"Course not found"});
            }
            else{
                res.statusCode=200;
                res.json(course.students);
            }
        }, (err)=>{
            return (err);
        })
});

module.exports=router;

module.exports = router;
