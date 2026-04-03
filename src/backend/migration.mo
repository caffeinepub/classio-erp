import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type OldStudent = {
    id : Text;
    firstName : Text;
    lastName : Text;
    grade : Nat;
    contactEmail : Text;
    contactPhone : Text;
    parentName : Text;
    enrollmentDate : Int;
    isActive : Bool;
  };

  type NewStudent = {
    id : Text;
    firstName : Text;
    lastName : Text;
    grade : Nat;
    contactEmail : Text;
    contactPhone : Text;
    parentName : Text;
    enrollmentDate : Int;
    dob : ?Int;
    isActive : Bool;
  };

  type OldTeacher = {
    id : Text;
    firstName : Text;
    lastName : Text;
    subjects : [Text];
    contactEmail : Text;
    contactPhone : Text;
    dateOfJoin : Int;
    isActive : Bool;
  };

  type NewTeacher = {
    id : Text;
    firstName : Text;
    lastName : Text;
    subjects : [Text];
    contactEmail : Text;
    contactPhone : Text;
    dateOfJoin : Int;
    grade : ?Text;
    isActive : Bool;
  };

  type OldFinance = {
    timestamp : Int;
    feeId : Text;
    invoiceId : Text;
    paymentId : Text;
    expenseId : Text;
    gradeLevel : Text;
    year : Text;
    isActive : Bool;
    otherLabel : Text;
  };

  type OldFeeStructure = {
    id : Text;
    name : Text;
    description : Text;
    amount : Nat;
    gradeLevel : Text;
    academicYear : Text;
    isActive : Bool;
  };

  type NewFeeStructure = {
    id : Text;
    name : Text;
    description : Text;
    amount : Nat;
    gradeLevel : Text;
    academicYear : Text;
    feeType : Text;
    feeTypeLabel : Text;
    isActive : Bool;
  };

  type OldActor = {
    students : Map.Map<Text, OldStudent>;
    teachers : Map.Map<Text, OldTeacher>;
    feeStructures : Map.Map<Text, OldFeeStructure>;
  };

  type NewActor = {
    students : Map.Map<Text, NewStudent>;
    teachers : Map.Map<Text, NewTeacher>;
    feeStructures : Map.Map<Text, NewFeeStructure>;
  };

  public func run(old : OldActor) : NewActor {
    let newStudents = old.students.map<Text, OldStudent, NewStudent>(
      func(_id, oldStudent) {
        {
          oldStudent with
          dob = null;
        };
      }
    );

    let newTeachers = old.teachers.map<Text, OldTeacher, NewTeacher>(
      func(_id, oldTeacher) {
        {
          oldTeacher with
          grade = null;
        };
      }
    );

    let newFeeStructures = old.feeStructures.map<Text, OldFeeStructure, NewFeeStructure>(
      func(_id, oldFee) {
        {
          oldFee with
          feeType = "tuition";
          feeTypeLabel = "";
        };
      }
    );

    {
      students = newStudents;
      teachers = newTeachers;
      feeStructures = newFeeStructures;
    };
  };
};
